'use client';

import { useEffect } from 'react';
import { useSession } from '@/providers/session-provider';
import type { AnonymousSession } from '@/lib/types/anonymous';
import {
  getAnonymousSession,
  createAnonymousSession,
  setAnonymousSession,
  clearAnonymousSession,
} from '@/lib/anonymous-session-client';

/**
 * Type guard that verifies whether a value conforms to the AnonymousSession shape.
 *
 * @param obj - The value to validate as an AnonymousSession
 * @returns `true` if `obj` has an `id` string, `remainingCredits` number, and `createdAt` as a `Date` or string, `false` otherwise.
 */
function isValidAnonymousSession(obj: any): obj is AnonymousSession {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.remainingCredits === 'number' &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === 'string')
  );
}

/**
 * Initializes and persists an anonymous session for users who are not authenticated.
 *
 * Runs on the client when session loading is complete: it loads any stored anonymous session,
 * validates and migrates or replaces it if the schema is invalid, and creates and persists a new
 * anonymous session when none exists. This component has no visual output.
 *
 * @returns `null` — the component does not render any UI
 */
export function AnonymousSessionInit() {
  const { data: session, isPending } = useSession();

  useEffect(() => {
    // Only initialize for non-authenticated users after session is loaded
    if (isPending) return;
    if (session?.user) return;

    // Get raw session data and validate/migrate
    const existingSession = getAnonymousSession();

    if (existingSession) {
      // Validate the existing session schema
      if (!isValidAnonymousSession(existingSession)) {
        console.warn(
          'Invalid session schema detected during init, clearing and creating new session',
        );
        clearAnonymousSession();
        const newSession = createAnonymousSession();
        setAnonymousSession(newSession);
        return;
      }

      console.log('Valid anonymous session found');
    } else {
      // Create new session if none exists
      console.log('No anonymous session found, creating new one');
      const newSession = createAnonymousSession();
      setAnonymousSession(newSession);
    }
  }, [session, isPending]);

  return null; // This component doesn't render anything
}