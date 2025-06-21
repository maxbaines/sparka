'use client';

import { useEffect, useRef } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { YourUIMessage } from '@/lib/types/ui';

export type DataPart =
  | { type: 'append-message'; message: string }
  | { type: 'message-continues'; messageId: string; sequence?: number };

export interface UseAutoResumeProps {
  autoResume: boolean;
  initialMessages: YourUIMessage[];
  experimental_resume: UseChatHelpers['experimental_resume'];
  data: UseChatHelpers['data'];
  setMessages: UseChatHelpers['setMessages'];
}

export function useAutoResume({
  autoResume,
  initialMessages,
  experimental_resume,
  data,
  setMessages,
}: UseAutoResumeProps) {
  const processedSignals = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!autoResume) return;

    const mostRecentMessage = initialMessages.at(-1);
    console.log('mostRecentMessage', mostRecentMessage);
    if (
      mostRecentMessage?.role === 'user' ||
      (mostRecentMessage?.role === 'assistant' && mostRecentMessage.isPartial)
    ) {
      console.log('Running experimental_resume');
      experimental_resume();
    }

    // we intentionally run this once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const dataPart = data[data.length - 1] as DataPart;

    if (dataPart.type === 'append-message') {
      const message = JSON.parse(dataPart.message) as YourUIMessage;
      setMessages([...initialMessages, message]);
    } else if (dataPart.type === 'message-continues') {
      const signalKey = `continues-${dataPart.messageId}-${dataPart.sequence || 0}`;

      // Only process if we haven't already processed this signal
      if (!processedSignals.current.has(signalKey)) {
        console.log(
          'Received message-continues signal, calling experimental_resume for message:',
          dataPart.messageId,
          'sequence:',
          dataPart.sequence || 0,
        );
        processedSignals.current.add(signalKey);
        experimental_resume();
      } else {
        console.log(
          'Already processed message-continues signal for message:',
          dataPart.messageId,
          'sequence:',
          dataPart.sequence || 0,
        );
      }
    }
  }, [data, initialMessages, setMessages, experimental_resume]);
}
