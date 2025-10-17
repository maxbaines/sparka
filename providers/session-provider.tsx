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

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return ctx;
}
