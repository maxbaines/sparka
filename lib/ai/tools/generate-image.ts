import { z } from 'zod';
import { tool } from 'ai';
import { experimental_generateImage } from 'ai';
import { getImageModel } from '@/lib/ai/providers';

export const generateImage = tool({
  description: `Generate images from text descriptions.

Usage:
- Create images, artwork, illustrations from descriptive prompts
- Generate visual content based on user requests
- Support various art styles and subjects

Examples:
- "A sunset over mountains"
- "A futuristic city skyline" 
- "Abstract art with vibrant colors"`,
  parameters: z.object({
    prompt: z
      .string()
      .describe('Detailed description of the image to generate'),
  }),
  execute: async ({ prompt }) => {
    const { image } = await experimental_generateImage({
      model: getImageModel('alias/image-model'),
      prompt,
      n: 1,
      providerOptions: {
        experimental_telemetry: { isEnabled: true },
      },
    });

    return {
      imageBase64: image.base64,
      prompt,
    };
  },
});
