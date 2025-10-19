'use client';
import type { ModelId } from '@ai-models/vercel-gateway';
import { type Dispatch, type SetStateAction, useCallback } from 'react';
import type { ChatMessage } from '@/lib/ai/types';
import { useChatStatus } from '@/lib/stores/hooks';
import {
  getAttachmentsFromMessage,
  getTextContentFromMessage,
} from '@/lib/utils';
import { ChatInputProvider } from '@/providers/chat-input-provider';
import { MultimodalInput } from './multimodal-input';

export type MessageEditorProps = {
  chatId: string;
  message: ChatMessage;
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  parentMessageId: string | null;
};

function MessageEditorContent({
  chatId,
  setMode,
  parentMessageId,
}: MessageEditorProps & { onModelChange?: (modelId: string) => void }) {
  const status = useChatStatus();

  const handleOnSendMessage = useCallback(
    (_: ChatMessage) => {
      setMode('view');
    },
    [setMode],
  );

  return (
    <div className="w-full">
      <MultimodalInput
        chatId={chatId}
        status={status}
        onSendMessage={handleOnSendMessage}
        isEditMode={true}
        parentMessageId={parentMessageId}
      />
    </div>
  );
}

export function MessageEditor(
  props: MessageEditorProps & { onModelChange?: (modelId: string) => void },
) {
  // Get the initial input value from the message content
  const initialInput = getTextContentFromMessage(props.message);
  const initialAttachments = getAttachmentsFromMessage(props.message);

  // Use selectedModel from the message metadata, or fall back to current selected model
  const messageSelectedModel = props.message.metadata?.selectedModel as ModelId;
  const { parentMessageId: _parentMessageId, ...rest } = props;
  return (
    <ChatInputProvider
      key={`edit-${props.message.id}`}
      initialInput={initialInput}
      initialAttachments={initialAttachments}
      initialTool={props.message.metadata?.selectedTool}
      localStorageEnabled={false}
      overrideModelId={messageSelectedModel || undefined}
    >
      <MessageEditorContent
        {...rest}
        parentMessageId={props.message.metadata?.parentMessageId}
      />
    </ChatInputProvider>
  );
}
