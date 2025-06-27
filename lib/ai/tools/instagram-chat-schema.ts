import { z } from 'zod';

export const InstagramUserSchema = z.object({
  username: z.string(),
  full_name: z.string(),
  pk: z.string(),
  profile_pic_url: z.string().optional(),
  profile_pic_url_hd: z.string().nullable().optional(),
  is_private: z.boolean().optional(),
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
  text: z.string().optional().nullable(),
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
  pk: z.string(),
  id: z.string(),
  thread_title: z.string(),
  thread_type: z.string().optional(),
  users: z.array(InstagramUserSchema),
  messages: z.array(InstagramMessageSchema),
  last_activity_at: z.string(),
  inviter: InstagramUserSchema.optional(),
  left_users: z.array(InstagramUserSchema).optional(),
  admin_user_ids: z.array(z.string()).optional(),
  muted: z.boolean().optional(),
  is_pin: z.boolean().optional(),
  named: z.boolean().optional(),
  canonical: z.boolean().optional(),
  pending: z.boolean().optional(),
  archived: z.boolean().optional(),
  folder: z.number().optional(),
  vc_muted: z.boolean().optional(),
  is_group: z.boolean().optional(),
  mentions_muted: z.boolean().optional(),
  approval_required_for_new_members: z.boolean().optional(),
  input_mode: z.number().optional(),
  business_thread_folder: z.number().optional(),
  read_state: z.number().optional(),
  is_close_friend_thread: z.boolean().optional(),
  assigned_admin_id: z.number().optional(),
  shh_mode_enabled: z.boolean().optional(),
  last_seen_at: z.record(z.any()).optional(),
});

export const InstagramChatsResultSchema = z.object({
  success: z.boolean(),
  threads: z.array(InstagramChatSchema),
});

export type InstagramUser = z.infer<typeof InstagramUserSchema>;
export type InstagramMessage = z.infer<typeof InstagramMessageSchema>;
export type InstagramChat = z.infer<typeof InstagramChatSchema>;
export type InstagramChatsResult = z.infer<typeof InstagramChatsResultSchema>;
