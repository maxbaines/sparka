import { z } from 'zod';
import { tool } from 'ai';
import { experimental_generateImage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { uploadFile } from '@/lib/blob';

export const generateImage = tool({
  description: `Generate images from text descriptions.

Usage:
- Create images, artwork, illustrations from descriptive prompts
- Generate visual content based on user requests
- Support various art styles and subjects
- Be as detailed as possible in the description
"`,
  parameters: z.object({
    prompt: z
      .string()
      .describe('Detailed description of the image to generate'),
  }),
  execute: async ({ prompt }) => {
    const { image } = await experimental_generateImage({
      model: openai.image('dall-e-3'),
      prompt,
      n: 1,
      providerOptions: {
        experimental_telemetry: { isEnabled: true },
      },
    });

    // Convert base64 to buffer
    const buffer = Buffer.from(image.base64, 'base64');

    // Generate filename with timestamp
    const timestamp = Date.now();
    const filename = `generated-image-${timestamp}.png`;

    // Upload to blob storage
    const uploadResult = await uploadFile(filename, buffer);

    return {
      imageUrl: uploadResult.url,
      prompt,
    };
  },
});
