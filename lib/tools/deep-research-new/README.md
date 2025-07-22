# Deep Research New - AI SDK Implementation

This is a new implementation of the deep research system using AI SDK in TypeScript, based on the LangGraph Python architecture from `open_deep_research`.

## Architecture Overview

The system follows a hierarchical agent coordination pattern:

1. **ResearchOrchestrator** - Main orchestration flow
2. **ResearchSupervisor** - Coordinates parallel research efforts  
3. **IndividualResearcher** - Executes individual research tasks

### Core Flow

```
User Input → Clarification → Research Brief → Supervised Research → Final Report
```

## Key Components

### ResearchOrchestrator (`research-orchestrator.ts`)
- Main entry point for research requests
- Handles the 4-phase research process:
  1. Clarification Phase (optional)
  2. Research Brief Generation
  3. Supervised Research Coordination
  4. Final Report Generation

### ResearchSupervisor (`research-supervisor.ts`)
- Plans and coordinates research tasks
- Determines when research is complete
- Breaks down complex topics into focused research tasks
- **NEW**: Implements full tool execution loop with iteration limits
- **NEW**: Handles concurrent research task execution and overflow
- **NEW**: Conducts supervised research with proper state management

### IndividualResearcher (`individual-researcher.ts`)
- Executes specific research tasks with tool calling loop
- **NEW**: Implements ReAct-style tool calling pattern
- **NEW**: Tool execution with error handling
- **NEW**: Research findings compression and cleaning
- Integrates with multiple search providers (mock implementations)

## Configuration

The system is highly configurable through the `ResearchConfig` interface:

```typescript
interface ResearchConfig {
  allowClarification: boolean;        // Enable clarification phase
  maxConcurrentResearch: number;      // Parallel research tasks
  maxResearchIterations: number;      // Max research cycles
  maxToolCalls: number;              // Max tool calls per task
  maxRetries: number;                // Max retries for LLM calls
  searchProvider: 'tavily' | 'openai' | 'anthropic';
  models: {
    research: string;                 // Model for research tasks
    compression: string;              // Model for compressing findings
    finalReport: string;              // Model for final report
  };
}
```

## Usage

### Basic Usage

```typescript
import { ResearchOrchestrator } from './research-orchestrator';
import type { ResearchConfig } from './types';

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
    finalReport: 'gpt-4'
  }
};

const orchestrator = new ResearchOrchestrator(config);
const result = await orchestrator.conductResearch(
  "Analyze renewable energy trends in 2024"
);
```

### Pre-configured Options

- `basicConfig` - Lightweight research for simple queries
- `advancedConfig` - Comprehensive research for complex topics

## Implementation Status

### ✅ Completed
- ✅ Core architecture and class structure
- ✅ Complete research orchestration flow
- ✅ Configuration system with all needed fields
- ✅ Type definitions for all components
- ✅ **NEW**: Full supervisor logic with tool execution loop
- ✅ **NEW**: Individual researcher with ReAct tool calling
- ✅ **NEW**: Research findings compression
- ✅ **NEW**: Proper state management and iteration limits
- ✅ **NEW**: Error handling and graceful degradation
- ✅ **NEW**: Mock tool implementations for testing

### 🚧 Next Phase (Tool System Integration)
- Search provider integrations (Tavily, OpenAI, Anthropic)
- Real tool definitions and schemas
- API authentication and management
- Streaming support for real-time updates

### 📋 Future Enhancements
- Background execution and resuming
- Integration with existing tool ecosystem
- Advanced error recovery mechanisms
- Performance optimizations

## Key Differences from LangGraph Version

1. **Class-based Architecture** instead of LangGraph nodes
2. **Promise-based Concurrency** instead of LangGraph's async execution
3. **Direct Tool Integration** using AI SDK's tool system
4. **Simplified State Management** without complex state graphs
5. **TypeScript Type Safety** throughout the pipeline

## Node Mapping Completion

| LangGraph Node | TypeScript Implementation | Status |
|----------------|---------------------------|---------|
| `clarify_with_user` | `ResearchOrchestrator.clarifyWithUser()` | ✅ Complete |
| `write_research_brief` | `ResearchOrchestrator.generateResearchBrief()` | ✅ Complete |
| `supervisor` | `ResearchSupervisor.planResearch()` | ✅ Complete |
| `supervisor_tools` | `ResearchSupervisor.executeTools()` | ✅ Complete |
| `researcher` | `IndividualResearcher.researchWithTools()` | ✅ Complete |
| `researcher_tools` | `IndividualResearcher.executeTools()` | ✅ Complete |
| `compress_research` | `IndividualResearcher.compressFindings()` | ✅ Complete |
| `final_report_generation` | `ResearchOrchestrator.generateFinalReport()` | ✅ Complete |

## Files

- `types.ts` - TypeScript interfaces and types
- `research-orchestrator.ts` - Main orchestration logic
- `research-supervisor.ts` - Research planning and coordination
- `individual-researcher.ts` - Individual research execution  
- `usage-example.ts` - Usage examples and configurations
- `implementation-mapping.md` - Detailed mapping documentation
- `README.md` - This documentation

## Integration Notes

This implementation now provides **complete functional equivalence** to the Python LangGraph version for the core research logic. The only remaining work is connecting real search APIs instead of mock implementations. The modular architecture allows for easy integration of actual search providers when ready. 