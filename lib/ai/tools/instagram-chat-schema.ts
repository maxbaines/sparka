import { z } from 'zod';

export const InstagramUserSchema = z.object({
  username: z.string(),
  full_name: z.string(),
  pk: z.string(),
});

export const InstagramMessageSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  thread_id: z.number(),
  timestamp: z.string(),
  item_type: z.string(),
  is_sent_by_viewer: z.boolean(),
  is_shh_mode: z.boolean(),
  reactions: z.any().nullable(),
  text: z.string().optional(),
  reply: z.any().nullable(),
  link: z.any().nullable(),
  animated_media: z.any().nullable(),
  media: z.any().nullable(),
  visual_media: z.any().nullable(),
  media_share: z.any().nullable(),
  reel_share: z.any().nullable(),
  story_share: z.any().nullable(),
  felix_share: z.any().nullable(),
  xma_share: z.any().nullable(),
  clip: z.any().nullable(),
  placeholder: z.any().nullable(),
  client_context: z.string(),
});

export const InstagramChatSchema = z.object({
  thread_id: z.string(),
  thread_title: z.string(),
  users: z.array(InstagramUserSchema),
  last_activity_at: z.string(),
  last_message: InstagramMessageSchema,
});

export const InstagramChatsResultSchema = z.object({
  success: z.boolean(),
  threads: z.array(InstagramChatSchema),
});

export type InstagramUser = z.infer<typeof InstagramUserSchema>;
export type InstagramMessage = z.infer<typeof InstagramMessageSchema>;
export type InstagramChat = z.infer<typeof InstagramChatSchema>;
export type InstagramChatsResult = z.infer<typeof InstagramChatsResultSchema>;
