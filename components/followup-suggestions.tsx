'use client';

import type { ChatMessage } from '@/lib/ai/types';
import type { UiToolName } from '@/lib/ai/types';
import { useChatStoreApi } from '@/lib/stores/chat-store-context';
import { useChatInput } from '@/providers/chat-input-provider';
import { generateUUID } from '@/lib/utils';
import { useCallback } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import {
  useMessagePartByPartIdx,
  useMessagePartTypesById,
} from '@/lib/stores/hooks-message-parts';
import { Separator } from './ui/separator';

export function FollowUpSuggestions({
  suggestions,
  className,
}: {
  suggestions: string[];
  className?: string;
}) {
  const storeApi = useChatStoreApi();
  const { selectedModelId, selectedTool } = useChatInput();

  const handleClick = useCallback(
    (suggestion: string) => {
      const sendMessage = storeApi.getState().currentChatHelpers?.sendMessage;
      if (!sendMessage) return;

      const parentMessageId = storeApi.getState().getLastMessageId();

      const message: ChatMessage = {
        id: generateUUID(),
        role: 'user',
        parts: [
          {
            type: 'text',
            text: suggestion,
          },
        ],
        metadata: {
          createdAt: new Date(),
          parentMessageId,
          selectedModel: selectedModelId,
          selectedTool: (selectedTool as UiToolName | null) || undefined,
        },
      };

      sendMessage(message);
    },
    [storeApi, selectedModelId, selectedTool],
  );

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-2 mt-3 mb-2', className)}>
      <div className="text-base font-medium">Related</div>
      <div className="flex flex-wrap items-center gap-y-1">
        {suggestions.map((s, i) => (
          <div key={s} className="flex flex-col w-full">
            <Button
              type="button"
              variant="link"
              onClick={() => handleClick(s)}
              className="has-[>svg]:px-0 px-0 h-auto w-full justify-between text-foreground hover:text-primary hover:no-underline font-normal"
            >
              {s}
              <PlusIcon />
            </Button>
            {i < suggestions.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </div>
  );
}

export function FollowUpSuggestionsParts({
  messageId,
}: {
  messageId: string;
}) {
  const types = useMessagePartTypesById(messageId);

  const partIdx = types.findIndex((t) => t === 'data-followupSuggestions');
  if (partIdx === -1) return null;
  return <FollowUpSuggestionsPart messageId={messageId} partIdx={partIdx} />;
}

function FollowUpSuggestionsPart({
  messageId,
  partIdx,
}: {
  messageId: string;
  partIdx: number;
}) {
  const part = useMessagePartByPartIdx(
    messageId,
    partIdx,
    'data-followupSuggestions',
  );
  const { data } = part;

  return <FollowUpSuggestions suggestions={data.suggestions} />;
}
