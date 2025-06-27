import { z } from 'zod';

export const InstagramStoryUserSchema = z.object({
  username: z.string(),
  full_name: z.string(),
  user_id: z.string(),
});

export const InstagramStorySchema = z.object({
  story_id: z.string(),
  media_type: z.number(), // 1 = image, 2 = video
  taken_at: z.string(),
  user: InstagramStoryUserSchema,
  media_url: z.string(),
  video_url: z.string().optional(),
  video_duration: z.number().optional(),
});

export const InstagramStoriesResultSchema = z.object({
  success: z.boolean(),
  stories: z.array(InstagramStorySchema),
  count: z.number(),
});

export type InstagramStoryUser = z.infer<typeof InstagramStoryUserSchema>;
export type InstagramStory = z.infer<typeof InstagramStorySchema>;
export type InstagramStoriesResult = z.infer<
  typeof InstagramStoriesResultSchema
>;
