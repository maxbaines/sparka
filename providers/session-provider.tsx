'use client';

import { createContext, useContext, useMemo } from 'react';
import type { Session } from '@/lib/auth';
import authClient from '@/lib/auth-client';

type SessionContextValue = {
  data: Session | undefined;
  isPending: boolean;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined,
);

/**
 * Provides session context to descendant components.
 *
 * The provider reads session state from the auth client, normalizes it into the app's
 * Session shape, and exposes an object with `data` (the effective session or `undefined`)
 * and `isPending` via context. While the client session is pending, `initialSession`
 * (if provided) will be used as the effective session.
 *
 * @param initialSession - Optional session to use while the client session is pending
 * @param children - Child nodes that will receive the session context
 * @returns A React provider element that supplies `SessionContextValue` to descendants
 */
export function SessionProvider({
  initialSession,
  children,
}: {
  initialSession?: Session;
  children: React.ReactNode;
}) {
  const { data: clientSessionRaw, isPending } = authClient.useSession();

  function toAppSession(input: any): Session | undefined {
    if (!input) return undefined;
    // better-auth client returns { user, session } or null
    const u = input.user ?? input?.user;
    if (!u) return undefined;
    const expiresAt =
      input.session?.expiresAt ?? input.session?.expires ?? input.expiresAt;
    return {
      user: {
        id: u.id,
        name: u.name ?? null,
        email: u.email ?? null,
        image: u.image ?? null,
      },
      expires: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    } satisfies Session;
  }

  const clientSession = toAppSession(clientSessionRaw);

  const value = useMemo<SessionContextValue>(() => {
    const effective = isPending
      ? (initialSession ?? clientSession)
      : clientSession;
    return { data: effective, isPending };
  }, [clientSession, initialSession, isPending]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/**
 * Accesses the current session context for the calling component.
 *
 * @returns The current session context value containing `data` (the Session or `undefined`) and `isPending` (`boolean`).
 * @throws Error if invoked outside of a `SessionProvider`.
 */
export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}