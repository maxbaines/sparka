import type { ModelId } from '@/lib/models/model-id';
import { generatedModelFeatures } from './model-features.generated';

export interface ModelFeatures {
  knowledgeCutoff?: Date;
  releaseDate: Date;
  // temperature: boolean; // TODO: does it replace fixedTemperature?
  // last updated: Date;
  // weights: "Open" | "Closed"
  fixedTemperature?: number;
}

// All the literals in ModelId that are not keys of generatedModelFeatures
type GeneratedModelFeaturesModelId = keyof typeof generatedModelFeatures;
type CustomModelFeaturesModelId = Exclude<
  ModelId,
  GeneratedModelFeaturesModelId
>;

const searchedModelFeatures: Record<CustomModelFeaturesModelId, ModelFeatures> =
  {
    'google/gemini-2.5-flash-lite': {
      releaseDate: new Date('2025-06-17'),
      knowledgeCutoff: new Date('2025-01-01'),
    },
    'openai/gpt-3.5-turbo': {
      releaseDate: new Date('2023-03-01'),
      knowledgeCutoff: new Date('2021-09-01'),
    },
    'openai/gpt-3.5-turbo-instruct': {
      releaseDate: new Date('2023-08-22'),
      knowledgeCutoff: new Date('2021-09-01'),
    },
    'zai/glm-4.5': {
      releaseDate: new Date('2025-07-28'),
      knowledgeCutoff: new Date('2024-04-01'),
    },
    'zai/glm-4.5-air': {
      releaseDate: new Date('2025-07-28'),
      knowledgeCutoff: new Date('2024-04-01'),
    },
    // Cohere Command family (official: docs.cohere.com)
    'cohere/command-a': {
      releaseDate: new Date('2024-10-21'),
    },
    'cohere/command-r': {
      releaseDate: new Date('2024-03-12'),
    },
    'cohere/command-r-plus': {
      releaseDate: new Date('2024-03-12'),
    },
    // Meta Llama 3.2 Vision Instruct (official: ai.meta.com)
    'meta/llama-3.2-11b': {
      releaseDate: new Date('2024-09-25'),
    },
    'meta/llama-3.2-90b': {
      releaseDate: new Date('2024-09-25'),
    },

    // Perplexity Sonar (official: docs.perplexity.ai)
    'perplexity/sonar': {
      releaseDate: new Date('2023-12-15'),
    },
    'perplexity/sonar-pro': {
      releaseDate: new Date('2024-03-12'),
    },
    'perplexity/sonar-reasoning': {
      releaseDate: new Date('2024-03-12'),
    },
    'perplexity/sonar-reasoning-pro': {
      releaseDate: new Date('2024-05-01'),
    },
    'deepseek/deepseek-v3': {
      releaseDate: new Date('2025-03-24'),
    },
    'deepseek/deepseek-v3.1': {
      releaseDate: new Date('2025-07-10'),
    },
    'deepseek/deepseek-v3.1-base': {
      releaseDate: new Date('2025-07-10'),
    },

    // Google Gemma
    'google/gemma-2-9b': {
      releaseDate: new Date('2024-06-27'),
    },

    // Inception
    'inception/mercury-coder-small': {
      releaseDate: new Date('2025-02-01'),
    },

    // Meta Llama (text-only)
    'meta/llama-3-70b': {
      releaseDate: new Date('2024-04-18'),
    },
    'meta/llama-3-8b': {
      releaseDate: new Date('2024-04-18'),
    },
    'meta/llama-3.1-70b': {
      releaseDate: new Date('2024-07-23'),
    },
    'meta/llama-3.1-8b': {
      releaseDate: new Date('2024-07-23'),
    },
    'meta/llama-3.2-1b': {
      releaseDate: new Date('2024-09-25'),
    },
    'meta/llama-3.2-3b': {
      releaseDate: new Date('2024-09-25'),
    },

    'mistral/devstral-small': {
      releaseDate: new Date('2024-06-26'),
    },

    // Zhipu AI (ZAI)
    'zai/glm-4.5v': {
      releaseDate: new Date('2025-08-11'),
    },

    // Alibaba Qwen3 (text-only here)
    'alibaba/qwen-3-14b': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen-3-235b': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen-3-30b': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen-3-32b': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-coder': {
      releaseDate: new Date('2025-07-15'),
    },

    // Alibaba Qwen3 additional variants (aligned with Qwen3 release)
    'alibaba/qwen3-coder-30b-a3b': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-coder-plus': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-max': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-max-preview': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-next-80b-a3b-instruct': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-next-80b-a3b-thinking': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-vl-instruct': {
      releaseDate: new Date('2025-07-15'),
    },
    'alibaba/qwen3-vl-thinking': {
      releaseDate: new Date('2025-07-15'),
    },

    'google/gemini-2.5-flash-image': {
      releaseDate: new Date('2025-06-17'),
      knowledgeCutoff: new Date('2025-06-01'),
    },
    'mistral/mistral-medium': {
      releaseDate: new Date('2023-12-11'),
    },

    // Anthropic Claude
    'anthropic/claude-3.5-sonnet-20240620': {
      releaseDate: new Date('2024-06-20'),
    },
  };

export const modelFeatures = {
  ...generatedModelFeatures,
  ...searchedModelFeatures,
};
