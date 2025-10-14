'use client';

// Hooks that are used to mutate the chat store
// They use local storage functions from '@/lib/utils/anonymous-chat-storage' for anonymous users
// They use tRPC mutations for authenticated users

import { useSession } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCallback, useMemo } from 'react';

import { useTRPC } from '@/trpc/react';
import {
  dbMessageToChatMessage,
  chatMessageToDbMessage,
} from '@/lib/message-conversion';
import { useChatId } from '@/providers/chat-id-provider';
import type { UIChat } from '@/lib/types/uiChat';
import type { Document } from '@/lib/db/schema';
import {
  loadLocalAnonymousMessagesByChatId,
  saveAnonymousMessage,
  deleteAnonymousChat,
  renameAnonymousChat,
  saveAnonymousChatToStorage,
  deleteAnonymousTrailingMessages,
  cloneAnonymousChat,
  loadAnonymousDocumentsByDocumentId,
  saveAnonymousDocument,
  loadAnonymousChatsFromStorage,
  loadAnonymousChatById,
  pinAnonymousChat,
} from '@/lib/utils/anonymous-chat-storage';
import { getAnonymousSession } from '@/lib/anonymous-session-client';
import { generateUUID, getTextContentFromMessage } from '@/lib/utils';
import type { ChatMessage } from '@/lib/ai/types';
import { useDualMutation } from '@/hooks/use-dual-mutation';
import { useDualQueryOptions } from '@/hooks/use-dual-query';

export function useSaveChat() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const generateTitleMutation = useMutation(
    trpc.chat.generateTitle.mutationOptions({
      onError: (error) => {
        console.error('Failed to generate title:', error);
      },
    }),
  );

  const saveChatMutation = useMutation({
    mutationFn: async ({
      chatId,
      message,
    }: { chatId: string; message: string }) => {
      // Save chat with temporary title first
      const tempChat = {
        id: chatId,
        title: 'Untitled',
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'private' as const,
      };

      await saveAnonymousChatToStorage({ ...tempChat, isPinned: false });
      return { tempChat, message };
    },
    onSuccess: async ({ tempChat, message }) => {
      // Generate proper title asynchronously after successful save
      const data = await generateTitleMutation.mutateAsync({ message });
      if (data?.title) {
        // Update the chat with the generated title
        await saveAnonymousChatToStorage({
          ...tempChat,
          title: data.title,
          isPinned: false,
        });

        // Invalidate chats to refresh the UI
        queryClient.invalidateQueries({
          queryKey: trpc.chat.getAllChats.queryKey(),
        });
      }
    },
    onError: (error) => {
      console.error('Failed to save chat:', error);
      toast.error('Failed to save chat');
    },
  });

  const saveChat = useCallback(
    (chatId: string, message: string, isAuthenticated: boolean) => {
      // Skip if authenticated (API handles it)
      if (isAuthenticated) {
        return;
      }

      return saveChatMutation.mutate({ chatId, message });
    },
    [saveChatMutation],
  );

  return {
    saveChat,
    isSaving: saveChatMutation.isPending,
    isGeneratingTitle: generateTitleMutation.isPending,
  };
}

export function useGetChatMessagesQueryOptions() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();
  const { id: chatId, type } = useChatId();

  const getMessagesByChatIdQueryOptions = useDualQueryOptions({
    remote: trpc.chat.getChatMessages.queryOptions({ chatId: chatId || '' }),
    local: async () => {
      try {
        const restored = await loadLocalAnonymousMessagesByChatId(chatId || '');
        return restored.map(dbMessageToChatMessage);
      } catch (error) {
        console.error('Error loading anonymous messages:', error);
        return [];
      }
    },
    shouldUseLocalAction: () => !isAuthenticated,
    enabled: !!chatId && (isAuthenticated ? type === 'chat' : true),
    deps: [trpc.chat.getChatMessages, isAuthenticated, chatId, type],
  });

  return getMessagesByChatIdQueryOptions;
}

export function useMessagesQuery() {
  const options = useGetChatMessagesQueryOptions();

  return options;
}

interface ChatMutationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
export function useDeleteChat() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();

  const getAllChatsQueryKey = useMemo(
    () => trpc.chat.getAllChats.queryKey(),
    [trpc.chat.getAllChats],
  );

  // Use dual mutation to unify local/API behavior and keep optimistic updates centralized
  const deleteMutation = useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: {
      mutationFn: async ({ chatId }) => {
        const m = trpc.chat.deleteChat.mutationOptions();
        if (!m.mutationFn) throw new Error('Remote mutationFn missing');
        await m.mutationFn({ chatId });
      },
    },
    local: async ({ chatId }) => {
      await deleteAnonymousChat(chatId);
    },
    onMutateAction: async ({ chatId }, qc) => {
      await qc.cancelQueries({ queryKey: getAllChatsQueryKey });
      const previousChats = qc.getQueryData<UIChat[]>(getAllChatsQueryKey);
      qc.setQueryData<UIChat[]>(
        getAllChatsQueryKey,
        (old) => old?.filter((c) => c.id !== chatId) ?? old,
      );
      return { previousChats };
    },
    onErrorAction: (_err, _vars, ctx, qc) => {
      if (ctx?.previousChats) {
        qc.setQueryData(getAllChatsQueryKey, ctx.previousChats);
      }
    },
    onSettledAction: async (_data, _err, _vars, _ctx, qc) => {
      await qc.invalidateQueries({ queryKey: getAllChatsQueryKey });
    },
  });

  const deleteChat = useCallback(
    async (chatId: string, options?: ChatMutationOptions) => {
      try {
        await deleteMutation.mutateAsync({ chatId });
        options?.onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error : new Error('Unknown error');
        options?.onError?.(errorMessage);
        throw errorMessage;
      }
    },
    [deleteMutation],
  );

  return { deleteChat };
}

export function useRenameChat() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const getAllChatsQueryKey = useMemo(
    () => trpc.chat.getAllChats.queryKey(),
    [trpc.chat.getAllChats],
  );

  const renameMutation = useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: { mutationFn: trpc.chat.renameChat.mutationOptions().mutationFn },
    local: async ({ chatId, title }) => {
      await renameAnonymousChat(chatId, title);
    },
    onMutateAction: async ({ chatId, title }, qc) => {
      await qc.cancelQueries({ queryKey: getAllChatsQueryKey });
      const previousChats = qc.getQueryData<UIChat[]>(getAllChatsQueryKey);
      qc.setQueryData<UIChat[]>(getAllChatsQueryKey, (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === chatId ? { ...c, title } : c));
      });
      return { previousChats };
    },
    onErrorAction: (_err, _vars, context, qc) => {
      if (context?.previousChats) {
        qc.setQueryData(getAllChatsQueryKey, context.previousChats);
      }
      toast.error('Failed to rename chat');
    },
    onSettledAction: async (_data, _error, _vars, _ctx, qc) => {
      await qc.invalidateQueries({ queryKey: getAllChatsQueryKey });
    },
  });

  return renameMutation;
}

export function usePinChat() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();

  const getAllChatsQueryKey = useMemo(
    () => trpc.chat.getAllChats.queryKey(),
    [trpc.chat.getAllChats],
  );

  const pinMutation = useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: { mutationFn: trpc.chat.setIsPinned.mutationOptions().mutationFn },
    local: async ({
      chatId,
      isPinned,
    }: { chatId: string; isPinned: boolean }) => {
      await pinAnonymousChat(chatId, isPinned);
      return { success: true } as const;
    },
    onMutateAction: async ({ chatId, isPinned }, qc) => {
      await qc.cancelQueries({ queryKey: getAllChatsQueryKey });
      const previousChats = qc.getQueryData<UIChat[]>(getAllChatsQueryKey);
      qc.setQueryData<UIChat[]>(getAllChatsQueryKey, (old) => {
        if (!old) return old;
        return old.map((c) => (c.id === chatId ? { ...c, isPinned } : c));
      });
      return { previousChats } as const;
    },
    onErrorAction: (_err, _vars, context, qc) => {
      if (context?.previousChats) {
        qc.setQueryData(getAllChatsQueryKey, context.previousChats);
      }
      toast.error('Failed to pin chat');
    },
    onSettledAction: async (_data, _err, _vars, _ctx, qc) => {
      await qc.invalidateQueries({ queryKey: getAllChatsQueryKey });
    },
  });

  return pinMutation;
}

export function useDeleteTrailingMessages() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const deleteTrailingMutationOptions = useMemo(
    () => trpc.chat.deleteTrailingMessages.mutationOptions(),
    [trpc.chat.deleteTrailingMessages],
  );

  const invalidateMessagesByChatId = useCallback(
    (chatId: string) => {
      queryClient.invalidateQueries({
        queryKey: trpc.chat.getChatMessages.queryKey({ chatId }),
      });
    },
    [queryClient, trpc.chat.getChatMessages],
  );

  // Delete trailing messages mutation (dual: API vs anonymous local)
  const deleteTrailingMessagesMutation = useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: {
      mutationFn: async ({
        messageId,
      }: {
        messageId: string;
        chatId: string; // accepted for local optimistic updates, ignored remotely
      }) => {
        return await deleteTrailingMutationOptions?.mutationFn?.({ messageId });
      },
    },
    local: async ({ messageId }: { messageId: string; chatId: string }) => {
      await deleteAnonymousTrailingMessages(messageId);
      return { success: true } as const;
    },
    onMutateAction: async (
      { messageId, chatId }: { messageId: string; chatId: string },
      qc,
    ) => {
      const messagesQueryKey = trpc.chat.getChatMessages.queryKey({ chatId });
      await qc.cancelQueries({ queryKey: messagesQueryKey });
      const previousMessages = qc.getQueryData<ChatMessage[]>(messagesQueryKey);
      qc.setQueryData<ChatMessage[] | undefined>(messagesQueryKey, (old) => {
        if (!old) return old;
        const messageIndex = old.findIndex((msg) => msg.id === messageId);
        if (messageIndex === -1) return old;
        return old.slice(0, messageIndex);
      });
      return { previousMessages, messagesQueryKey } as const;
    },
    onErrorAction: (_err, _vars, context, qc) => {
      if (context?.previousMessages) {
        qc.setQueryData(context.messagesQueryKey, context.previousMessages);
      }
      toast.error('Failed to delete messages');
    },
    onSuccessAction: (_data, { chatId }) => {
      invalidateMessagesByChatId(chatId);
      toast.success('Messages deleted');
    },
  });

  return deleteTrailingMessagesMutation;
}

export function useCloneChat() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const getAllChatsQueryKey = useMemo(
    () => trpc.chat.getAllChats.queryKey(),
    [trpc.chat.getAllChats],
  );

  const copyPublicChatMutationOptions = useMemo(
    () => trpc.chat.cloneSharedChat.mutationOptions(),
    [trpc.chat.cloneSharedChat],
  );

  return useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: { mutationFn: copyPublicChatMutationOptions?.mutationFn },
    local: async ({ chatId }: { chatId: string }) => {
      const originalChat = queryClient.getQueryData(
        trpc.chat.getPublicChat.queryKey({ chatId }),
      );
      const originalMessages = queryClient.getQueryData(
        trpc.chat.getPublicChatMessages.queryKey({ chatId }),
      ) as ChatMessage[] | undefined;
      if (!originalChat || !originalMessages) {
        throw new Error('Original chat data not found in cache');
      }
      const originalMessagesIds = originalMessages.map((m) => m.id);
      const allDocumentQueries = queryClient.getQueriesData({
        queryKey: trpc.document.getPublicDocuments
          .queryKey({ id: '' })
          .slice(0, -1),
      });
      const originalDocuments = allDocumentQueries
        .flatMap(([, data]) => (data as Document[] | undefined) ?? [])
        .filter((document: any) =>
          originalMessagesIds.includes(document.messageId),
        );
      const newId = generateUUID();
      await cloneAnonymousChat(
        originalMessages.map((message) =>
          chatMessageToDbMessage(message, chatId),
        ),
        originalChat,
        originalDocuments as Document[],
        newId,
      );
      return { chatId: newId } as const;
    },
    onSettledAction: async (_data, _err, _vars, _ctx, qc) => {
      await qc.refetchQueries({ queryKey: getAllChatsQueryKey });
    },
    onErrorAction: (error) => {
      console.error('Failed to copy chat:', error);
    },
  });
}

export function useSaveMessageMutation() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { saveChat: saveChatWithTitle } = useSaveChat();

  return useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: {
      mutationFn: async ({
        message,
        chatId,
      }: { message: ChatMessage; chatId: string }) => {
        // API persists via server side; local cache updates handled in onMutateAction
        return { success: true } as const;
      },
    },
    local: async ({
      message,
      chatId,
    }: { message: ChatMessage; chatId: string }) => {
      await saveAnonymousMessage(chatMessageToDbMessage(message, chatId));
      return { success: true } as const;
    },
    onMutateAction: async ({ message, chatId }, qc) => {
      const messagesQueryKey = trpc.chat.getChatMessages.queryKey({ chatId });
      await qc.cancelQueries({ queryKey: messagesQueryKey });
      const previousMessages = qc.getQueryData<ChatMessage[]>(messagesQueryKey);
      qc.setQueryData<ChatMessage[]>(messagesQueryKey, (old) => {
        if (!old) return [message];
        return [...old, message];
      });
      return { previousMessages, messagesQueryKey } as const;
    },
    onErrorAction: (err, _vars, context, qc) => {
      if (context?.previousMessages) {
        qc.setQueryData(context.messagesQueryKey, context.previousMessages);
      }
      console.error('Failed to save message:', err);
      toast.error('Failed to save message');
    },
    onSuccessAction: (_data, { message, chatId }, _ctx, qc) => {
      if (isAuthenticated) {
        if (message.role === 'assistant') {
          qc.invalidateQueries({
            queryKey: trpc.credits.getAvailableCredits.queryKey(),
          });
        }
      } else {
        const messagesQueryKey = trpc.chat.getChatMessages.queryKey({ chatId });
        const messages = qc.getQueryData<ChatMessage[]>(messagesQueryKey);
        if ((messages?.length ?? 0) === 1) {
          saveChatWithTitle(
            chatId,
            getTextContentFromMessage(message),
            isAuthenticated,
          );
        }
      }
      if (message.role === 'assistant') {
        qc.invalidateQueries({ queryKey: trpc.chat.getAllChats.queryKey() });
      }
    },
  });
}

export function useSetVisibility() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const getAllChatsQueryKey = useMemo(
    () => trpc.chat.getAllChats.queryKey(),
    [trpc.chat.getAllChats],
  );

  return useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: {
      mutationFn: trpc.chat.setVisibility.mutationOptions().mutationFn,
    },
    local: async ({
      chatId,
      visibility,
    }: {
      chatId: string;
      visibility: 'private' | 'public';
    }) => {
      const chat = await loadAnonymousChatById(chatId);
      if (!chat) throw new Error('Chat not found');
      await saveAnonymousChatToStorage({ ...chat, visibility });
      return { success: true } as const;
    },
    onErrorAction: () => {
      toast.error('Failed to update chat visibility');
    },
    onSettledAction: async (_data, _err, _vars, _ctx, qc) => {
      await qc.invalidateQueries({ queryKey: getAllChatsQueryKey });
    },
    onSuccessAction: (_data, variables) => {
      const message =
        variables.visibility === 'public'
          ? 'Chat is now public - anyone with the link can access it'
          : 'Chat is now private - only you can access it';
      toast.success(message);
    },
  });
}

export function useSaveDocument(
  documentId: string,
  messageId: string,
  options?: {
    onSettled?: (result: any, error: any, params: any) => void;
  },
) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isAuthenticated = !!session?.user;
  const anonymousSession = getAnonymousSession();

  return useDualMutation({
    shouldUseLocalAction: () => !isAuthenticated,
    remote: {
      mutationFn: trpc.document.saveDocument.mutationOptions().mutationFn,
    },
    local: async (newDocument: {
      id: string;
      title: string;
      content: string;
      kind: Document['kind'];
    }) => {
      const documentToSave = {
        id: newDocument.id,
        createdAt: new Date(),
        title: newDocument.title,
        content: newDocument.content,
        kind: newDocument.kind,
        userId: anonymousSession?.id || '',
        messageId: messageId,
      } satisfies Document;
      await saveAnonymousDocument(documentToSave);
      return { success: true } as const;
    },
    onMutateAction: async (newDocument, qc) => {
      const queryKey = trpc.document.getDocuments.queryKey({
        id: newDocument.id,
      });
      await qc.cancelQueries({ queryKey });
      const previousDocuments = qc.getQueryData<Document[]>(queryKey) ?? [];
      const optimisticData: Document[] = [
        ...previousDocuments,
        {
          id: newDocument.id,
          createdAt: new Date(),
          title: newDocument.title,
          content: newDocument.content,
          kind: newDocument.kind as Document['kind'],
          userId: isAuthenticated ? userId || '' : anonymousSession?.id || '',
          messageId: messageId,
        } as Document,
      ];
      qc.setQueryData(queryKey, optimisticData);
      return { previousDocuments, newDocument } as const;
    },
    onErrorAction: (_err, newDocument, context, qc) => {
      if (context?.previousDocuments) {
        const queryKey = trpc.document.getDocuments.queryKey({
          id: newDocument.id,
        });
        qc.setQueryData(queryKey, context.previousDocuments);
      }
    },
    onSettledAction: (result, error, params, _ctx, qc) => {
      qc.invalidateQueries({
        queryKey: trpc.document.getDocuments.queryKey({ id: params.id }),
      });
      options?.onSettled?.(result, error, params);
    },
  });
}

export function useDocuments(id: string, disable: boolean) {
  const trpc = useTRPC();
  const { type } = useChatId();
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const documentsQueryOptions = useDualQueryOptions({
    remote:
      type === 'shared'
        ? trpc.document.getPublicDocuments.queryOptions({ id })
        : trpc.document.getDocuments.queryOptions({ id }),
    local:
      type !== 'shared'
        ? async () => await loadAnonymousDocumentsByDocumentId(id || '')
        : undefined,
    shouldUseLocalAction: () => type !== 'shared' && !isAuthenticated,
    enabled: !disable && !!id,
    deps: [
      trpc.document.getDocuments,
      trpc.document.getPublicDocuments,
      id,
      disable,
      type,
      isAuthenticated,
    ],
  });

  return useQuery(documentsQueryOptions as any);
}

export function useGetAllChats(limit?: number) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();
  const getAllChatsQueryOptions = useDualQueryOptions({
    remote: trpc.chat.getAllChats.queryOptions(),
    local: async () => {
      const chats = await loadAnonymousChatsFromStorage();
      return chats.map(
        (chat) =>
          ({
            id: chat.id,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt || chat.createdAt,
            title: chat.title,
            visibility: chat.visibility,
            userId: '',
            isPinned: chat.isPinned || false,
          }) satisfies UIChat,
      );
    },
    shouldUseLocalAction: () => !isAuthenticated,
    // Narrowing hint for generic select typing in useDualQueryOptions
    select: (limit
      ? (data: unknown) => (data as UIChat[]).slice(0, limit)
      : undefined) as ((input: unknown) => unknown) | undefined,
    deps: [trpc.chat.getAllChats, isAuthenticated, limit],
  });

  return useQuery(getAllChatsQueryOptions as any);
}

export function useGetChatByIdQueryOptions(chatId: string) {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();

  const getChatByIdQueryOptions = useDualQueryOptions({
    remote: trpc.chat.getChatById.queryOptions({ chatId }),
    local: async () => {
      const chat = await loadAnonymousChatById(chatId);
      if (!chat) throw new Error('Chat not found');
      return {
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt || chat.createdAt,
        title: chat.title,
        visibility: chat.visibility,
        userId: '',
        isPinned: chat.isPinned || false,
      } satisfies UIChat;
    },
    shouldUseLocalAction: () => !isAuthenticated,
    enabled: !!chatId,
    deps: [trpc.chat.getChatById, isAuthenticated, chatId],
  });

  return getChatByIdQueryOptions;
}

export function useGetChatById(chatId: string) {
  const options = useGetChatByIdQueryOptions(chatId);
  return useQuery(options);
}

export function useGetCredits() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const trpc = useTRPC();

  const queryOptions = useDualQueryOptions({
    remote: trpc.credits.getAvailableCredits.queryOptions(),
    local: async () => {
      const anonymousSession = getAnonymousSession();
      return {
        totalCredits: anonymousSession?.remainingCredits ?? 0,
        availableCredits: anonymousSession?.remainingCredits ?? 0,
        reservedCredits: 0,
      };
    },
    shouldUseLocalAction: () => !isAuthenticated,
    deps: [isAuthenticated, trpc.credits.getAvailableCredits],
  });

  const { data: creditsData, isLoading: isLoadingCredits } = useQuery(
    queryOptions as any,
  );

  return {
    credits: (creditsData as { totalCredits: number } | undefined)
      ?.totalCredits,
    isLoadingCredits,
  };
}
