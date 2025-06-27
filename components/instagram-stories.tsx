'use client';

import { formatDistanceToNow } from 'date-fns';
import type { InstagramStoriesResult } from '@/lib/ai/tools/instagram-stories-schema';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Image as ImageIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import NextImage from 'next/image';

interface InstagramStoriesProps {
  result: InstagramStoriesResult;
}

export function InstagramStories({ result }: InstagramStoriesProps) {
  const [selectedStory, setSelectedStory] = useState<string | null>(null);

  if (!result.success || !result.stories || result.stories.length === 0) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Instagram Stories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No stories found.</p>
        </CardContent>
      </Card>
    );
  }

  const { stories, count } = result;

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Instagram Stories
          </div>
          <Badge variant="secondary">{count} stories</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((story) => (
            <div
              key={story.story_id}
              className="relative group cursor-pointer rounded-lg overflow-hidden border hover:shadow-lg transition-all"
              onClick={() =>
                setSelectedStory(
                  selectedStory === story.story_id ? null : story.story_id,
                )
              }
            >
              {/* Story Preview */}
              <div className="relative aspect-[9/16] bg-muted">
                <NextImage
                  src={story.media_url}
                  alt={`Story by ${story.user.username}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Video indicator */}
                {story.media_type === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-black/60 rounded-full p-3">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                )}

                {/* Duration badge for videos */}
                {story.media_type === 2 && story.video_duration && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded px-2 py-1 text-xs text-white flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {story.video_duration}s
                  </div>
                )}

                {/* Media type badge */}
                <div className="absolute top-2 left-2">
                  <Badge
                    variant={story.media_type === 1 ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {story.media_type === 1 ? 'Photo' : 'Video'}
                  </Badge>
                </div>
              </div>

              {/* Story Info */}
              <div className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {story.user.username.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {story.user.full_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{story.user.username}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(story.taken_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>

              {/* Expanded view */}
              {selectedStory === story.story_id && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
                  {story.media_type === 2 && story.video_url ? (
                    <video
                      src={story.video_url}
                      controls
                      autoPlay
                      muted
                      className="max-w-full max-h-full object-contain"
                      poster={story.media_url}
                    />
                  ) : (
                    <img
                      src={story.media_url}
                      alt={`Story by ${story.user.username}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              {stories.filter((s) => s.media_type === 1).length} photos
            </span>
            <span>
              {stories.filter((s) => s.media_type === 2).length} videos
            </span>
            <span>
              {[...new Set(stories.map((s) => s.user.username))].length} users
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
