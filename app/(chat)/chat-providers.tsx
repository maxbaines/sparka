'use client';

import type { Session } from '@/lib/auth';
import { ChatIdProvider } from '@/providers/chat-id-provider';

import { ChatPrefetch } from '@/components/chat-prefetch';
import { AnonymousSessionInit } from '@/components/anonymous-session-init';

interface ChatProvidersProps {
  children: React.ReactNode;
  user: Session['user'];
}

/**
 * Wraps children with chat-related providers and initializes anonymous session and chat prefetching.
 *
 * @param children - React nodes to render inside the chat providers
 * @param user - The session's user whose chat-related data will be prefetched
 * @returns A JSX element that renders `children` inside chat providers and initialization components
 */
export function ChatProviders({ children, user }: ChatProvidersProps) {
  return (
    <ChatIdProvider>
      <AnonymousSessionInit />
      <ChatPrefetch user={user} />
      {children}
    </ChatIdProvider>
  );
}