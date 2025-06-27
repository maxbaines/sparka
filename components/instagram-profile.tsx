'use client';

import NextImage from 'next/image';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  User,
  Users,
  Camera,
  CheckCircle,
  Lock,
  ExternalLink,
} from 'lucide-react';

interface InstagramProfileResult {
  success: boolean;
  user_info: {
    user_id: string;
    username: string;
    full_name: string;
    biography: string;
    follower_count: number;
    following_count: number;
    media_count: number;
    is_private: boolean;
    is_verified: boolean;
    profile_pic_url: string;
    external_url: string | null;
    category: string | null;
  };
}

interface InstagramProfileProps {
  result: InstagramProfileResult;
}

export function InstagramProfile({ result }: InstagramProfileProps) {
  if (!result.success || !result.user_info) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            User profile could not be loaded.
          </p>
        </CardContent>
      </Card>
    );
  }

  const { user_info } = result;

  const formatCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Instagram Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Picture */}
          <div className="relative">
            <NextImage
              src={user_info.profile_pic_url}
              alt={`${user_info.username}'s profile picture`}
              width={80}
              height={80}
              className="rounded-full"
            />
            {user_info.is_verified && (
              <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-blue-500 bg-white rounded-full" />
            )}
          </div>

          {/* Username and Full Name */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="font-semibold text-lg">@{user_info.username}</h3>
              {user_info.is_private && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {user_info.full_name && (
              <p className="text-muted-foreground">{user_info.full_name}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 w-full">
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatCount(user_info.media_count)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Camera className="h-3 w-3" />
                posts
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatCount(user_info.follower_count)}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                followers
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-lg">
                {formatCount(user_info.following_count)}
              </div>
              <div className="text-xs text-muted-foreground">following</div>
            </div>
          </div>

          {/* Biography */}
          {user_info.biography && (
            <div className="text-center max-w-full">
              <p className="text-sm whitespace-pre-line break-words">
                {user_info.biography}
              </p>
            </div>
          )}

          {/* External URL */}
          {user_info.external_url && (
            <a
              href={user_info.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              {user_info.external_url}
            </a>
          )}

          {/* Category */}
          {user_info.category && (
            <Badge variant="secondary" className="text-xs">
              {user_info.category}
            </Badge>
          )}

          {/* Account Status Badges */}
          <div className="flex gap-2">
            {user_info.is_verified && (
              <Badge variant="default" className="text-xs">
                Verified
              </Badge>
            )}
            {user_info.is_private && (
              <Badge variant="outline" className="text-xs">
                Private
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
