# Python LangGraph → TypeScript Implementation Mapping

## Main Graph Flow

| Python Node | TypeScript Implementation | Status | Notes |
|-------------|---------------------------|--------|-------|
| `clarify_with_user` | `ResearchOrchestrator.clarifyWithUser()` | ✅ Complete | Correctly implemented |
| `write_research_brief` | `ResearchOrchestrator.generateResearchBrief()` | ✅ Complete | Correctly implemented |
| `research_supervisor` (subgraph) | `ResearchOrchestrator.conductSupervisedResearch()` | ⚠️ Partial | Missing tool execution loop |
| `final_report_generation` | `ResearchOrchestrator.generateFinalReport()` | ✅ Complete | Correctly implemented |

## Supervisor Subgraph

| Python Node | TypeScript Implementation | Status | Notes |
|-------------|---------------------------|--------|-------|
| `supervisor` | `ResearchSupervisor.planResearch()` | ⚠️ Partial | Missing tool binding and iteration |
| `supervisor_tools` | **MISSING** | ❌ Missing | Needs `ResearchSupervisor.executeTools()` |

## Researcher Subgraph  

| Python Node | TypeScript Implementation | Status | Notes |
|-------------|---------------------------|--------|-------|
| `researcher` | **MISSING** | ❌ Missing | Needs `IndividualResearcher.researchWithTools()` |
| `researcher_tools` | **MISSING** | ❌ Missing | Needs `IndividualResearcher.executeTools()` |
| `compress_research` | **MISSING** | ❌ Missing | Needs `IndividualResearcher.compressFindings()` |

## Required New Methods

### ResearchSupervisor

```typescript
class ResearchSupervisor {
  // ✅ Exists
  async planResearch(brief: string, existingFindings: string[])
  
  // ❌ MISSING - equivalent to supervisor_tools node
  async executeTools(researchPlan: ResearchPlan, config: ResearchConfig): Promise<ToolResult[]>
}
```

### IndividualResearcher

```typescript  
class IndividualResearcher {
  // ❌ MISSING - equivalent to researcher node
  async researchWithTools(topic: string): Promise<ResearchSession>
  
  // ❌ MISSING - equivalent to researcher_tools node  
  async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]>
  
  // ❌ MISSING - equivalent to compress_research node
  async compressFindings(researchSession: ResearchSession): Promise<string>
  
  // ⚠️ EXISTS BUT INCOMPLETE - needs tool integration
  async research(topic: string): Promise<string>
}
```

## Tool System Requirements

### Tool Definitions Needed

```typescript
// ❌ MISSING
interface ConductResearchTool {
  name: 'ConductResearch'
  description: string
  inputSchema: z.ZodSchema
}

// ❌ MISSING  
interface ResearchCompleteTool {
  name: 'ResearchComplete'
  description: string
  inputSchema: z.ZodSchema
}

// ❌ MISSING
interface SearchTools {
  tavily: TavilySearchTool
  openai: OpenAISearchTool
  anthropic: AnthropicSearchTool
}
```

### Search Integrations Needed

```typescript
// ❌ ALL MISSING
class SearchProviders {
  async tavilySearch(queries: string[], config: SearchConfig): Promise<SearchResult[]>
  async openaiSearch(query: string, config: SearchConfig): Promise<SearchResult[]>  
  async anthropicSearch(query: string, config: SearchConfig): Promise<SearchResult[]>
}
```

## Configuration Gaps

The TypeScript `ResearchConfig` is missing these Python configuration equivalents:

| Python Config | TypeScript Equivalent | Status |
|---------------|----------------------|--------|
| `max_structured_output_retries` | `maxRetries` | ❌ Missing |
| `max_react_tool_calls` | `maxToolCalls` | ❌ Missing |
| `research_model` | `models.research` | ✅ Exists |
| `compression_model` | `models.compression` | ✅ Exists |
| `final_report_model` | `models.finalReport` | ✅ Exists |
| `search_api` | `searchProvider` | ✅ Exists |

## State Management Gaps

The TypeScript implementation needs these state tracking capabilities:

| Python State | TypeScript Equivalent | Status |
|--------------|----------------------|--------|
| `research_iterations` | Tool iteration tracking | ❌ Missing |
| `tool_call_iterations` | Tool call counting | ❌ Missing |
| `researcher_messages` | Message history | ❌ Missing |
| `supervisor_messages` | Supervisor context | ❌ Missing |
| `raw_notes` | Raw research data | ❌ Missing |

## Prompt Templates Needed

All of these Python prompts need TypeScript equivalents:

- `lead_researcher_prompt` → ResearchSupervisor prompts
- `research_system_prompt` → IndividualResearcher prompts  
- `compress_research_system_prompt` → Compression prompts
- `final_report_generation_prompt` → Final report prompts
- `clarify_with_user_instructions` → Clarification prompts 