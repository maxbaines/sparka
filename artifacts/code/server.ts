import { z } from 'zod';
import { streamObject } from 'ai';
import { getLanguageModel } from '@/lib/ai/providers';
import { codePrompt, updateDocumentPrompt } from '@/lib/ai/prompts';
import { createDocumentHandler } from '@/lib/artifacts/server';

export const codeDocumentHandler = createDocumentHandler<'code'>({
  kind: 'code',
  onCreateDocument: async ({
    title,
    description,
    dataStream,
    prompt,
    selectedModel,
  }) => {
    let draftContent = '';
    let draftLanguage = 'python';

    const { fullStream } = streamObject({
      model: getLanguageModel(selectedModel),
      system: codePrompt,
      prompt,
      experimental_telemetry: { isEnabled: true },
      schema: z.object({
        code: z.string(),
        language: z
          .enum([
            'python',
            'typescript',
            'javascript',
            'java',
            'cpp',
            'c',
            'go',
            'rust',
            'php',
            'ruby',
            'swift',
            'kotlin',
            'scala',
            'dart',
            'r',
            'sql',
            'html',
            'css',
            'json',
            'yaml',
            'xml',
            'markdown',
            'plaintext',
          ])
          .default('python'),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { code, language } = object;

        if (code) {
          dataStream.writeData({
            type: 'code-delta',
            content: code ?? '',
            language: language ?? 'python',
          });

          draftContent = code;
        }

        if (language) {
          draftLanguage = language;
        }
      }
    }

    // Store language metadata with the content
    return JSON.stringify({
      code: draftContent,
      language: draftLanguage,
    });
  },
  onUpdateDocument: async ({
    document,
    description,
    dataStream,
    selectedModel,
  }) => {
    let draftContent = '';
    let draftLanguage = 'python';

    // Parse existing content to get language
    let existingLanguage = 'python';
    try {
      if (document.content) {
        const parsed = JSON.parse(document.content);
        existingLanguage = parsed.language || 'python';
      }
    } catch {
      // If parsing fails, treat as plain code
      existingLanguage = 'python';
    }

    const { fullStream } = streamObject({
      model: getLanguageModel(selectedModel),
      system: updateDocumentPrompt(document.content, 'code'),
      experimental_telemetry: { isEnabled: true },
      prompt: description,
      schema: z.object({
        code: z.string(),
        language: z
          .enum([
            'python',
            'typescript',
            'javascript',
            'java',
            'cpp',
            'c',
            'go',
            'rust',
            'php',
            'ruby',
            'swift',
            'kotlin',
            'scala',
            'dart',
            'r',
            'sql',
            'html',
            'css',
            'json',
            'yaml',
            'xml',
            'markdown',
            'plaintext',
          ])
          .default(existingLanguage as any),
      }),
    });

    for await (const delta of fullStream) {
      const { type } = delta;

      if (type === 'object') {
        const { object } = delta;
        const { code, language } = object;

        if (code) {
          dataStream.writeData({
            type: 'code-delta',
            content: code ?? '',
            language: language ?? existingLanguage,
          });

          draftContent = code;
        }

        if (language) {
          draftLanguage = language;
        }
      }
    }

    // Store language metadata with the content
    return JSON.stringify({
      code: draftContent,
      language: draftLanguage,
    });
  },
});
