// types.ts
interface ResearchConfig {
  allowClarification: boolean;
  maxConcurrentResearch: number;
  maxResearchIterations: number;
  maxToolCalls: number;
  maxRetries: number;
  searchProvider: 'tavily' | 'openai' | 'anthropic';
  models: {
    research: string;
    compression: string;
    finalReport: string;
  };
}

interface ResearchState {
  messages: Array<any>;
  researchBrief?: string;
  findings: string[];
  isComplete: boolean;
  researchIterations?: number;
  rawNotes?: string[];
}

interface ResearchTask {
  id: string;
  topic: string;
  findings: string;
  isComplete: boolean;
  priority?: number;
}

interface ResearchPlan {
  isComplete: boolean;
  tasks: Array<{
    id: string;
    topic: string;
    priority: number;
  }>;
}

interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

interface ToolResult {
  toolCallId: string;
  result: string;
  error?: string;
}

interface ResearchSession {
  topic: string;
  messages: Array<any>;
  toolCalls: ToolCall[];
  toolResults: ToolResult[];
  toolCallIterations: number;
  isComplete: boolean;
}

interface SupervisorState {
  supervisorMessages: Array<any>;
  researchBrief: string;
  researchIterations: number;
  findings: string[];
  rawNotes: string[];
}

export type {
  ResearchConfig,
  ResearchState,
  ResearchTask,
  ResearchPlan,
  ToolCall,
  ToolResult,
  ResearchSession,
  SupervisorState,
};
