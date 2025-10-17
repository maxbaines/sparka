'use client';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ShareButton } from './share-button';
import { Share } from 'lucide-react';
import type { Session } from '@/lib/auth';
import { HeaderActions } from '@/components/header-actions';

/**
 * Render the chat header with controls for toggling the sidebar, sharing status, and user actions.
 *
 * Renders a sticky horizontal header containing a left group (sidebar toggle, share button or shared indicator)
 * and a right group with user-specific actions.
 *
 * @param chatId - Identifier for the current chat (used by the ShareButton when rendered)
 * @param isReadonly - If `true`, show a non-interactive "Shared" indicator instead of the ShareButton
 * @param hasMessages - Whether the chat contains messages; the ShareButton is only shown when `true` and not readonly
 * @param user - Current session user passed through to header action controls
 * @returns The header element containing the sidebar toggle, share UI or shared indicator, and header actions
 */
function PureChatHeader({
  chatId,
  isReadonly,
  hasMessages,
  user,
}: {
  chatId: string;
  isReadonly: boolean;
  hasMessages: boolean;
  user: Session['user'];
}) {
  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2 justify-between h-(--header-height)">
      <div className="flex items-center gap-2">
        <SidebarToggle />

        {!isReadonly && hasMessages && <ShareButton chatId={chatId} />}
        {isReadonly && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground text-sm">
                <Share size={14} className="opacity-70" />
                <span>Shared</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <div className="font-medium">Shared Chat</div>
                <div className="text-xs text-muted-foreground mt-1">
                  This is a shared chat
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      <HeaderActions user={user} />
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.hasMessages === nextProps.hasMessages;
});