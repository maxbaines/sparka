'use client';

import { formatDistanceToNow } from 'date-fns';
import type { InstagramChatsResult } from '@/lib/ai/tools/instagram-chat-schema';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, Users } from 'lucide-react';

interface InstagramChatsProps {
  result: InstagramChatsResult;
}

export function InstagramChats({ result }: InstagramChatsProps) {
  const chats = result.threads;
  const count = chats.length;

  if (!result.success || !chats || chats.length === 0) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Instagram Chats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No chats found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Instagram Chats
          </div>
          <Badge variant="secondary">{count} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {chats.map((chat) => {
            // Get the most recent message (first in array)
            const lastMessage = chat.messages
              ? chat.messages[0]
              : chat.last_message;

            return (
              <div
                key={chat.pk}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex -space-x-2">
                  {chat.users.slice(0, 2).map((user, index) => (
                    <div
                      key={user.pk}
                      className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center overflow-hidden"
                    >
                      {user.profile_pic_url ? (
                        <img
                          src={user.profile_pic_url}
                          alt={user.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-medium">
                          {user.username.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                  {chat.users.length > 2 && (
                    <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                      <Users className="h-4 w-4" />
                      <span className="text-xs ml-1">
                        +{chat.users.length - 2}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">
                      {chat.thread_title}
                    </h3>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(chat.last_activity_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground mb-2">
                    {chat.users.map((user) => user.username).join(', ')}
                  </div>

                  {(chat.messages && chat.messages.length > 0) ||
                    (chat.last_message && (
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              lastMessage.is_sent_by_viewer
                                ? 'secondary'
                                : 'default'
                            }
                            className="text-xs"
                          >
                            {lastMessage.is_sent_by_viewer
                              ? 'You Said'
                              : 'Said'}
                          </Badge>
                          {lastMessage.item_type !== 'text' && (
                            <Badge variant="outline" className="text-xs">
                              {lastMessage.item_type}
                            </Badge>
                          )}
                        </div>

                        {lastMessage.text && (
                          <div className="text-muted-foreground truncate">
                            "{lastMessage.text}"
                          </div>
                        )}

                        {!lastMessage.text &&
                          lastMessage.item_type !== 'text' && (
                            <div className="text-muted-foreground text-xs">
                              {lastMessage.item_type === 'clip' && 'Video clip'}
                              {lastMessage.item_type === 'placeholder' &&
                                'Unavailable content'}
                              {lastMessage.item_type ===
                                'expired_placeholder' && 'Expired content'}
                              {lastMessage.item_type === 'action_log' &&
                                'Action'}
                              {lastMessage.item_type === 'xma_reel_mention' &&
                                'Reel mention'}
                              {![
                                'clip',
                                'placeholder',
                                'expired_placeholder',
                                'action_log',
                                'xma_reel_mention',
                              ].includes(lastMessage.item_type) &&
                                `${lastMessage.item_type} message`}
                            </div>
                          )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
