import type { ModelId } from '@/lib/models/model-id';

type GeneratedFeatureDelta = {
  releaseDate: Date;
  knowledgeCutoff?: Date;
  input?: {
    audio?: boolean;
    video?: boolean;
  };
  output?: {
    audio?: boolean;
  };
};

export const generatedModelFeatures = {
  'amazon/nova-lite': {
    releaseDate: new Date('2024-12-03'),
    knowledgeCutoff: new Date('2024-10-01'),
    input: {
      video: true,
    },
  },
  'amazon/nova-micro': {
    releaseDate: new Date('2024-12-03'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'amazon/nova-pro': {
    releaseDate: new Date('2024-12-03'),
    knowledgeCutoff: new Date('2024-10-01'),
    input: {
      video: true,
    },
  },
  'anthropic/claude-3-haiku': {
    releaseDate: new Date('2024-03-13'),
    knowledgeCutoff: new Date('2023-08-31'),
  },
  'anthropic/claude-3-opus': {
    releaseDate: new Date('2024-02-29'),
    knowledgeCutoff: new Date('2023-08-31'),
  },
  'anthropic/claude-3.5-haiku': {
    releaseDate: new Date('2024-10-22'),
    knowledgeCutoff: new Date('2024-07-31'),
  },
  'anthropic/claude-3.5-sonnet': {
    releaseDate: new Date('2024-10-22'),
    knowledgeCutoff: new Date('2024-04-30'),
  },
  'anthropic/claude-3.7-sonnet': {
    releaseDate: new Date('2025-02-19'),
    knowledgeCutoff: new Date('2024-01-01'),
  },
  'anthropic/claude-opus-4': {
    releaseDate: new Date('2025-05-22'),
    knowledgeCutoff: new Date('2025-03-31'),
  },
  'anthropic/claude-opus-4.1': {
    releaseDate: new Date('2025-08-05'),
    knowledgeCutoff: new Date('2025-03-31'),
  },
  'anthropic/claude-sonnet-4': {
    releaseDate: new Date('2025-05-22'),
    knowledgeCutoff: new Date('2025-03-31'),
  },
  'anthropic/claude-sonnet-4.5': {
    releaseDate: new Date('2025-09-29'),
    knowledgeCutoff: new Date('2025-07-31'),
  },
  'deepseek/deepseek-r1': {
    releaseDate: new Date('2025-01-20'),
    knowledgeCutoff: new Date('2024-06-01'),
  },
  'deepseek/deepseek-r1-distill-llama-70b': {
    releaseDate: new Date('2025-01-23'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'deepseek/deepseek-v3.1-terminus': {
    releaseDate: new Date('2025-09-22'),
    knowledgeCutoff: new Date('2025-07-01'),
  },
  'google/gemini-2.0-flash': {
    releaseDate: new Date('2024-12-11'),
    knowledgeCutoff: new Date('2024-06-01'),
    input: {
      audio: true,
      video: true,
    },
  },
  'google/gemini-2.0-flash-lite': {
    releaseDate: new Date('2024-12-11'),
    knowledgeCutoff: new Date('2024-06-01'),
    input: {
      audio: true,
      video: true,
    },
  },
  'google/gemini-2.5-flash': {
    releaseDate: new Date('2025-06-17'),
    knowledgeCutoff: new Date('2025-01-01'),
    input: {
      audio: true,
      video: true,
    },
  },
  'google/gemini-2.5-pro': {
    releaseDate: new Date('2025-06-17'),
    knowledgeCutoff: new Date('2025-01-01'),
    input: {
      audio: true,
      video: true,
    },
  },
  'meta/llama-3.3-70b': {
    releaseDate: new Date('2024-12-06'),
    knowledgeCutoff: new Date('2023-12-01'),
  },
  'meta/llama-4-maverick': {
    releaseDate: new Date('2025-04-05'),
    knowledgeCutoff: new Date('2024-08-01'),
  },
  'meta/llama-4-scout': {
    releaseDate: new Date('2025-04-05'),
    knowledgeCutoff: new Date('2024-08-01'),
  },
  'mistral/codestral': {
    releaseDate: new Date('2024-05-29'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'mistral/magistral-medium': {
    releaseDate: new Date('2025-03-17'),
    knowledgeCutoff: new Date('2025-06-01'),
  },
  'mistral/magistral-small': {
    releaseDate: new Date('2025-03-17'),
    knowledgeCutoff: new Date('2025-06-01'),
  },
  'mistral/ministral-3b': {
    releaseDate: new Date('2024-10-01'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'mistral/ministral-8b': {
    releaseDate: new Date('2024-10-01'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'mistral/mistral-large': {
    releaseDate: new Date('2024-11-01'),
    knowledgeCutoff: new Date('2024-11-01'),
  },
  'mistral/mistral-small': {
    releaseDate: new Date('2024-09-01'),
    knowledgeCutoff: new Date('2025-03-01'),
  },
  'mistral/mixtral-8x22b-instruct': {
    releaseDate: new Date('2024-04-17'),
    knowledgeCutoff: new Date('2024-04-01'),
  },
  'mistral/pixtral-12b': {
    releaseDate: new Date('2024-09-01'),
    knowledgeCutoff: new Date('2024-09-01'),
  },
  'mistral/pixtral-large': {
    releaseDate: new Date('2024-11-01'),
    knowledgeCutoff: new Date('2024-11-01'),
  },
  'moonshotai/kimi-k2': {
    releaseDate: new Date('2025-07-11'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'moonshotai/kimi-k2-0905': {
    releaseDate: new Date('2025-09-05'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'morph/morph-v3-fast': {
    releaseDate: new Date('2024-08-15'),
  },
  'morph/morph-v3-large': {
    releaseDate: new Date('2024-08-15'),
  },
  'openai/gpt-4-turbo': {
    releaseDate: new Date('2023-11-06'),
    knowledgeCutoff: new Date('2023-12-01'),
  },
  'openai/gpt-4.1': {
    releaseDate: new Date('2025-04-14'),
    knowledgeCutoff: new Date('2024-04-01'),
  },
  'openai/gpt-4.1-mini': {
    releaseDate: new Date('2025-04-14'),
    knowledgeCutoff: new Date('2024-04-01'),
  },
  'openai/gpt-4.1-nano': {
    releaseDate: new Date('2025-04-14'),
    knowledgeCutoff: new Date('2024-04-01'),
  },
  'openai/gpt-4o': {
    releaseDate: new Date('2024-05-13'),
    knowledgeCutoff: new Date('2023-10-01'),
    input: {
      audio: true,
    },
  },
  'openai/gpt-4o-mini': {
    releaseDate: new Date('2024-07-18'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'openai/gpt-5': {
    releaseDate: new Date('2025-08-07'),
    knowledgeCutoff: new Date('2024-09-30'),
    input: {
      audio: true,
      video: true,
    },
    output: {
      audio: true,
    },
  },
  'openai/gpt-5-codex': {
    releaseDate: new Date('2025-09-15'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'openai/gpt-5-mini': {
    releaseDate: new Date('2025-08-07'),
    knowledgeCutoff: new Date('2024-05-30'),
  },
  'openai/gpt-5-nano': {
    releaseDate: new Date('2025-08-07'),
    knowledgeCutoff: new Date('2024-05-30'),
  },
  'openai/gpt-oss-120b': {
    releaseDate: new Date('2025-08-23'),
  },
  'openai/gpt-oss-20b': {
    releaseDate: new Date('2025-08-05'),
  },
  'openai/o1': {
    releaseDate: new Date('2024-09-12'),
    knowledgeCutoff: new Date('2023-10-01'),
  },
  'openai/o3': {
    releaseDate: new Date('2025-01-31'),
    knowledgeCutoff: new Date('2024-04-01'),
  },
  'openai/o3-mini': {
    releaseDate: new Date('2025-01-31'),
    knowledgeCutoff: new Date('2024-04-01'),
  },
  'openai/o4-mini': {
    releaseDate: new Date('2025-04-16'),
    knowledgeCutoff: new Date('2024-06-01'),
  },
  'vercel/v0-1.0-md': {
    releaseDate: new Date('2025-05-22'),
  },
  'vercel/v0-1.5-md': {
    releaseDate: new Date('2025-06-09'),
  },
  'xai/grok-2': {
    releaseDate: new Date('2024-08-20'),
    knowledgeCutoff: new Date('2024-08-01'),
  },
  'xai/grok-2-vision': {
    releaseDate: new Date('2024-08-20'),
    knowledgeCutoff: new Date('2024-08-01'),
  },
  'xai/grok-3': {
    releaseDate: new Date('2024-12-09'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'xai/grok-3-fast': {
    releaseDate: new Date('2025-02-17'),
    knowledgeCutoff: new Date('2024-11-01'),
  },
  'xai/grok-3-mini': {
    releaseDate: new Date('2024-12-09'),
    knowledgeCutoff: new Date('2024-10-01'),
  },
  'xai/grok-3-mini-fast': {
    releaseDate: new Date('2025-02-17'),
    knowledgeCutoff: new Date('2024-11-01'),
  },
  'xai/grok-4': {
    releaseDate: new Date('2025-07-09'),
    knowledgeCutoff: new Date('2025-07-01'),
  },
  'xai/grok-4-fast-non-reasoning': {
    releaseDate: new Date('2025-09-19'),
    knowledgeCutoff: new Date('2025-07-01'),
  },
  'xai/grok-code-fast-1': {
    releaseDate: new Date('2025-08-28'),
    knowledgeCutoff: new Date('2023-10-01'),
  },
} satisfies Partial<Record<ModelId, GeneratedFeatureDelta>>;
