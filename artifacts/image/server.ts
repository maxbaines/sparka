import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { experimental_generateImage } from 'ai';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, description, dataStream, prompt, session }) => {
    // Prevent anonymous users from generating images
    if (!session?.user?.id) {
      throw new Error('Image generation is not available for anonymous users. Please sign in to generate images.');
    }

    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt,
      n: 1,
      providerOptions: {
        experimental_telemetry: { isEnabled: true },
      },
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream, session }) => {
    // Prevent anonymous users from updating images
    if (!session?.user?.id) {
      throw new Error('Image generation is not available for anonymous users. Please sign in to generate images.');
    }

    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: myProvider.imageModel('small-model'),
      prompt: description,
      n: 1,
      providerOptions: {
        experimental_telemetry: { isEnabled: true },
      },
    });

    draftContent = image.base64;

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return draftContent;
  },
});
