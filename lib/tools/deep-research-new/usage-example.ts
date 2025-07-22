// usage-example.ts
import { ResearchOrchestrator } from './research-orchestrator';
import type { ResearchConfig } from './types';

// Example configuration
const config: ResearchConfig = {
  allowClarification: true,
  maxConcurrentResearch: 3,
  maxResearchIterations: 5,
  maxToolCalls: 10,
  maxRetries: 3,
  searchProvider: 'openai',
  models: {
    research: 'gpt-4',
    compression: 'gpt-4-mini',
    finalReport: 'gpt-4',
  },
};

// Example usage function
export async function exampleUsage() {
  const orchestrator = new ResearchOrchestrator(config);

  try {
    const result = await orchestrator.conductResearch(
      'I need a comprehensive analysis of renewable energy trends in 2024',
    );

    console.log('Research Result:');
    console.log(result);

    return result;
  } catch (error) {
    console.error('Research failed:', error);
    throw error;
  }
}

// Alternative configuration for basic research
export const basicConfig: ResearchConfig = {
  allowClarification: false,
  maxConcurrentResearch: 2,
  maxResearchIterations: 3,
  maxToolCalls: 5,
  maxRetries: 2,
  searchProvider: 'tavily',
  models: {
    research: 'gpt-4o-mini',
    compression: 'gpt-4o-mini',
    finalReport: 'gpt-4',
  },
};

// Alternative configuration for advanced research
export const advancedConfig: ResearchConfig = {
  allowClarification: true,
  maxConcurrentResearch: 5,
  maxResearchIterations: 10,
  maxToolCalls: 20,
  maxRetries: 3,
  searchProvider: 'openai',
  models: {
    research: 'gpt-4',
    compression: 'gpt-4',
    finalReport: 'gpt-4',
  },
};
