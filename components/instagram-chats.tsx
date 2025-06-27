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
          {chats.map((chat) => (
            <div
              key={chat.thread_id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex -space-x-2">
                {chat.users.slice(0, 2).map((user, index) => (
                  <div
                    key={user.pk}
                    className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                  >
                    <span className="text-xs font-medium">
                      {user.username.slice(0, 2).toUpperCase()}
                    </span>
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
                  <h3 className="font-medium truncate">{chat.thread_title}</h3>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatDistanceToNow(new Date(chat.last_activity_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  {chat.users.map((user) => user.username).join(', ')}
                </div>

                {chat.last_message?.text && (
                  <div className="text-sm">
                    <span className="font-medium">
                      {chat.last_message.is_sent_by_viewer
                        ? 'You'
                        : chat.users.find(
                            (u) => u.pk === chat.last_message.user_id,
                          )?.username || 'Unknown'}
                      :
                    </span>{' '}
                    <span className="text-muted-foreground truncate">
                      {chat.last_message.text}
                    </span>
                  </div>
                )}

                {chat.last_message?.item_type !== 'text' && (
                  <div className="text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {chat.last_message.item_type}
                    </Badge>{' '}
                    message
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
