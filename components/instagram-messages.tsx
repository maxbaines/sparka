'use client';

import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { MessageCircle, Play, Clock } from 'lucide-react';
import { useState } from 'react';
import NextImage from 'next/image';

interface InstagramMessage {
  id: string;
  user_id: string;
  thread_id: number;
  timestamp: string;
  item_type: string;
  is_sent_by_viewer: boolean;
  is_shh_mode: boolean;
  reactions: any;
  text?: string;
  reply: any;
  link: any;
  animated_media: any;
  media: any;
  visual_media: any;
  media_share: any;
  reel_share: any;
  story_share: any;
  felix_share: any;
  xma_share: any;
  clip: any;
  placeholder: any;
  client_context: string;
}

interface InstagramMessagesResult {
  success: boolean;
  messages: InstagramMessage[];
}

interface InstagramMessagesProps {
  result: InstagramMessagesResult;
}

export function InstagramMessages({ result }: InstagramMessagesProps) {
  const [expandedMedia, setExpandedMedia] = useState<string | null>(null);

  if (!result.success || !result.messages || result.messages.length === 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Instagram Messages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No messages found.</p>
        </CardContent>
      </Card>
    );
  }

  const { messages } = result;
  const count = messages.length;

  const renderMessageContent = (message: InstagramMessage) => {
    switch (message.item_type) {
      case 'text':
        return (
          <div className="p-3">
            <p className="text-sm">{message.text}</p>
          </div>
        );

      case 'clip':
        if (!message.clip) return null;
        const clip = message.clip;
        return (
          <div className="space-y-3">
            <div className="relative group cursor-pointer rounded-lg overflow-hidden border">
              <div className="relative aspect-video bg-muted">
                <NextImage
                  src={clip.thumbnail_url}
                  alt={`Clip by ${clip.user?.username || 'Unknown'}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="bg-black/60 rounded-full p-3">
                    <Play className="h-6 w-6 text-white fill-white" />
                  </div>
                </div>
                {clip.video_duration && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-2 py-1 text-xs text-white flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {clip.video_duration}s
                  </div>
                )}
              </div>
            </div>
            {clip.caption_text && (
              <div className="p-3">
                <p className="text-sm text-muted-foreground">
                  {clip.caption_text}
                </p>
              </div>
            )}
            {clip.user && (
              <div className="p-3 pt-0">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {clip.user.username.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{clip.user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      @{clip.user.username}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 'placeholder':
        if (!message.placeholder) return null;
        return (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium">{message.placeholder.title}</p>
            <p className="text-xs text-muted-foreground">
              {message.placeholder.message}
            </p>
          </div>
        );

      case 'expired_placeholder':
        return (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              Message expired
            </p>
          </div>
        );

      case 'action_log':
        return (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              System action
            </p>
          </div>
        );

      case 'xma_reel_mention':
        return (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground italic">
              Shared a reel
            </p>
          </div>
        );

      default:
        return (
          <div className="p-3">
            <Badge variant="outline" className="text-xs">
              {message.item_type}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              Unsupported message type
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Instagram Messages
          </div>
          <Badge variant="secondary">{count} messages</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.is_sent_by_viewer ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg border ${
                  message.is_sent_by_viewer
                    ? 'bg-primary/10 border-primary/20'
                    : 'bg-muted/50 border-muted'
                }`}
              >
                {renderMessageContent(message)}

                <div className="px-3 pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(message.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                    {message.reactions && (
                      <div className="flex gap-1">
                        {message.reactions.emojis?.map(
                          (reaction: any, index: number) => (
                            <span key={index} className="text-xs">
                              {reaction.emoji}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              {messages.filter((m) => m.item_type === 'text').length} text
              messages
            </span>
            <span>
              {messages.filter((m) => m.item_type === 'clip').length} clips
            </span>
            <span>
              {messages.filter((m) => m.is_sent_by_viewer).length} sent by you
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
