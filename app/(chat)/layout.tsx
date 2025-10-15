import { ChatProviders } from './chat-providers';
import { auth } from '../(auth)/auth';
import { cookies } from 'next/headers';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DefaultModelProvider } from '@/providers/default-model-provider';
import { DEFAULT_CHAT_MODEL, type AppModelId } from '@/lib/ai/app-models';
import { ANONYMOUS_LIMITS } from '@/lib/types/anonymous';
import { AppSidebar } from '@/components/app-sidebar';
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts';
import { SessionProvider } from 'next-auth/react';
import { TRPCReactProvider } from '@/trpc/react';
import { AIDevtools } from '@ai-sdk-tools/devtools';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  const cookieModel = cookieStore.get('chat-model')?.value as AppModelId;
  const isAnonymous = !session?.user;

  // Check if the model from cookie is available for anonymous users
  let defaultModel = cookieModel ?? DEFAULT_CHAT_MODEL;

  if (isAnonymous && cookieModel) {
    const isModelAvailable = ANONYMOUS_LIMITS.AVAILABLE_MODELS.includes(
      cookieModel as (typeof ANONYMOUS_LIMITS.AVAILABLE_MODELS)[number],
    );
    if (!isModelAvailable) {
      // Switch to default model if current model is not available for anonymous users
      defaultModel = DEFAULT_CHAT_MODEL;
    }
  }

  return (
    <SessionProvider session={session}>
      <TRPCReactProvider>
        <ChatProviders user={session?.user}>
          <SidebarProvider defaultOpen={!isCollapsed}>
            <AppSidebar />
            <SidebarInset
              style={
                {
                  '--header-height': 'calc(var(--spacing) * 13)',
                } as React.CSSProperties
              }
            >
              <DefaultModelProvider defaultModel={defaultModel}>
                <KeyboardShortcuts />

                {children}
              </DefaultModelProvider>
            </SidebarInset>
          </SidebarProvider>
        </ChatProviders>
        {process.env.NODE_ENV === 'development' && <AIDevtools />}
      </TRPCReactProvider>
    </SessionProvider>
  );
}
