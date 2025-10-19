'use client';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { ChatHeader } from '@/components/chat-header';
import { useSidebar } from '@/components/ui/sidebar';
import { useArtifactSelector } from '@/hooks/use-artifact';
import type { ChatMessage } from '@/lib/ai/types';
import { useChatStoreApi } from '@/lib/stores/chat-store-context';
import { useChatId, useChatStatus, useMessageIds } from '@/lib/stores/hooks';
import { cn } from '@/lib/utils';
import { useSession } from '@/providers/session-provider';
import { useTRPC } from '@/trpc/react';
import { Artifact } from './artifact';
import { MessagesPane } from './messages-pane';

export function Chat({
  id,
  initialMessages: _initialMessages,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<ChatMessage>;
  isReadonly: boolean;
}) {
  const chatStore = useChatStoreApi();
  const trpc = useTRPC();
  const { data: session } = useSession();
  const isLoading = id !== useChatId();

  const messageIds = useMessageIds() as string[];
  const status = useChatStatus();
  const stopAsync: UseChatHelpers<ChatMessage>['stop'] =
    useCallback(async () => {
      const helpers = chatStore.getState().currentChatHelpers;
      if (!helpers?.stop) return;
      return helpers.stop();
    }, [chatStore]);
  // regenerate no longer needs to be drilled; components call the store directly

  const { data: votes } = useQuery({
    ...trpc.vote.getVotes.queryOptions({ chatId: id }),
    enabled:
      messageIds.length >= 2 && !isReadonly && !!session?.user && !isLoading,
  });

  const { state } = useSidebar();
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div
        className={cn(
          '@container flex flex-col min-w-0 h-dvh bg-background md:max-w-[calc(100vw-var(--sidebar-width))] max-w-screen',
          state === 'collapsed' && 'md:max-w-screen',
        )}
      >
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
          hasMessages={messageIds.length > 0}
          user={session?.user}
        />

        <MessagesPane
          chatId={id}
          status={status}
          votes={votes}
          isReadonly={isReadonly}
          isVisible={!isArtifactVisible}
          className="bg-background"
        />
      </div>

      <Artifact
        chatId={id}
        status={status}
        stop={stopAsync}
        votes={votes}
        isReadonly={isReadonly}
        isAuthenticated={!!session?.user}
      />
    </>
  );
}
