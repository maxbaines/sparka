// individual-researcher.ts
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type {
  ResearchConfig,
  ToolCall,
  ToolResult,
  ResearchSession,
} from './types';

export class IndividualResearcher {
  constructor(private config: ResearchConfig) {}

  async research(topic: string): Promise<string> {
    // Use the new researchWithTools method and compress the results
    const session = await this.researchWithTools(topic);
    return await this.compressFindings(session);
  }

  async researchWithTools(topic: string): Promise<ResearchSession> {
    const session: ResearchSession = {
      topic,
      messages: [
        {
          role: 'system',
          content: `You are a research assistant conducting deep research on the user's input topic. Use the tools and search methods provided to research the user's input topic.

<Task>
Your job is to use tools and search methods to find information that can answer the question that a user asks.
You can use any of the tools provided to you to find resources that can help answer the research question. You can call these tools in series or in parallel, your research is conducted in a tool-calling loop.
</Task>

<Tool Calling Guidelines>
- Make sure you review all of the tools you have available to you, match the tools to the user's request, and select the tool that is most likely to be the best fit.
- In each iteration, select the BEST tool for the job, this may or may not be general websearch.
- When selecting the next tool to call, make sure that you are calling tools with arguments that you have not already tried.
- Tool calling is costly, so be sure to be very intentional about what you look up.
</Tool Calling Guidelines>

<Criteria for Finishing Research>
- You will be given a special "ResearchComplete" tool. This tool is used to indicate that you are done with your research.
- DO NOT call "ResearchComplete" unless you are satisfied with your research.
- One case where it's recommended to call this tool is if you see that your previous tool calls have stopped yielding useful information.
</Criteria for Finishing Research>

<Critical Reminders>
- You MUST conduct research using web search or a different tool before you are allowed to call "ResearchComplete"! You cannot call "ResearchComplete" without conducting research first!
- Do not repeat or summarize your research findings unless the user explicitly asks you to do so. Your main job is to call tools. You should call tools until you are satisfied with the research findings, and then call "ResearchComplete".
</Critical Reminders>`,
        },
        {
          role: 'user',
          content: topic,
        },
      ],
      toolCalls: [],
      toolResults: [],
      toolCallIterations: 0,
      isComplete: false,
    };

    // Conduct research using tool calling loop
    while (
      session.toolCallIterations < this.config.maxToolCalls &&
      !session.isComplete
    ) {
      const toolCalls = await this.generateToolCalls(session);

      if (toolCalls.length === 0) {
        // No more tool calls generated, research is complete
        session.isComplete = true;
        break;
      }

      session.toolCalls.push(...toolCalls);

      const toolResults = await this.executeTools(toolCalls);
      session.toolResults.push(...toolResults);

      // Add tool results to message history
      toolCalls.forEach((call, index) => {
        session.messages.push({
          role: 'assistant',
          content: '',
          toolCalls: [call],
        });
        session.messages.push({
          role: 'tool',
          content: toolResults[index]?.result || 'No result',
          toolCallId: call.id,
        });
      });

      session.toolCallIterations++;

      // Check if research is complete (ResearchComplete tool was called)
      const researchComplete = toolCalls.some(
        (call) => call.name === 'ResearchComplete',
      );
      if (researchComplete) {
        session.isComplete = true;
        break;
      }
    }

    return session;
  }

  async executeTools(toolCalls: ToolCall[]): Promise<ToolResult[]> {
    // Mock tool execution - in real implementation this would call actual search APIs
    const results: ToolResult[] = [];

    for (const toolCall of toolCalls) {
      try {
        let result: string;

        switch (toolCall.name) {
          case 'web_search':
          case 'tavily_search':
            result = await this.mockWebSearch(
              toolCall.args.query ||
                toolCall.args.queries?.[0] ||
                'general search',
            );
            break;
          case 'ResearchComplete':
            result = 'Research completed successfully.';
            break;
          default:
            result = `Mock result for ${toolCall.name} with args: ${JSON.stringify(toolCall.args)}`;
        }

        results.push({
          toolCallId: toolCall.id,
          result,
        });
      } catch (error) {
        results.push({
          toolCallId: toolCall.id,
          result: '',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async compressFindings(session: ResearchSession): Promise<string> {
    // Extract all tool results and research content
    const researchContent = session.toolResults
      .filter((result) => !result.error)
      .map((result) => result.result)
      .join('\n\n');

    if (!researchContent.trim()) {
      return `Research on "${session.topic}" could not be completed due to insufficient information.`;
    }

    const { text } = await generateText({
      model: openai(this.config.models.compression),
      prompt: `You are a research assistant that has conducted research on a topic by calling several tools and web searches. Your job is now to clean up the findings, but preserve all of the relevant statements and information that the researcher has gathered.

<Task>
You need to clean up information gathered from tool calls and web searches.
All relevant information should be repeated and rewritten verbatim, but in a cleaner format.
The purpose of this step is just to remove any obviously irrelevant or duplicative information.
For example, if three sources all say "X", you could say "These three sources all stated X".
Only these fully comprehensive cleaned findings are going to be returned to the user, so it's crucial that you don't lose any information.
</Task>

<Guidelines>
1. Your output findings should be fully comprehensive and include ALL of the information that the researcher has gathered from tool calls and web searches. It is expected that you repeat key information verbatim.
2. This report can be as long as necessary to return ALL of the information that the researcher has gathered.
3. In your report, you should return inline citations for each source that the researcher found.
4. You should include a "Sources" section at the end of the report that lists all of the sources the researcher found with corresponding citations.
5. Make sure to include ALL of the sources that the researcher gathered in the report, and how they were used to answer the question!
6. It's really important not to lose any sources. A later LLM will be used to merge this report with others, so having all of the sources is critical.
</Guidelines>

<Output Format>
The report should be structured like this:
**List of Queries and Tool Calls Made**
**Fully Comprehensive Findings**  
**List of All Relevant Sources (with citations in the report)**
</Output Format>

Critical Reminder: It is extremely important that any information that is even remotely relevant to the user's research topic is preserved verbatim (e.g. don't rewrite it, don't summarize it, don't paraphrase it).

Research Topic: ${session.topic}

Research Content to Clean Up:
${researchContent}

Please clean up these findings while preserving all relevant information.`,
    });

    return text;
  }

  private async generateToolCalls(
    session: ResearchSession,
  ): Promise<ToolCall[]> {
    // Mock tool call generation - in real implementation this would use the LLM with tool binding
    // For now, we'll simulate a research pattern

    if (session.toolCallIterations === 0) {
      // First iteration: initial search
      return [
        {
          id: `call_${Date.now()}_1`,
          name: 'web_search',
          args: {
            query: session.topic,
            max_results: 5,
          },
        },
      ];
    } else if (session.toolCallIterations === 1) {
      // Second iteration: more specific search
      return [
        {
          id: `call_${Date.now()}_2`,
          name: 'web_search',
          args: {
            query: `${session.topic} latest developments 2024`,
            max_results: 3,
          },
        },
      ];
    } else {
      // Final iteration: complete research
      return [
        {
          id: `call_${Date.now()}_complete`,
          name: 'ResearchComplete',
          args: {},
        },
      ];
    }
  }

  private async mockWebSearch(query: string): Promise<string> {
    // Mock search results - in real implementation this would call actual search APIs
    return `Mock search results for query: "${query}"
    
**Search Results:**
1. **Result Title 1** - Key finding about ${query} showing important data and metrics.
2. **Result Title 2** - Additional insights about ${query} with supporting evidence.
3. **Result Title 3** - Further information about ${query} including expert opinions.

**Key Information Found:**
- Important fact 1 about ${query}
- Significant data point regarding ${query}
- Expert opinion on ${query}
- Recent developments in ${query}

**Sources:**
[1] https://example.com/source1
[2] https://example.com/source2  
[3] https://example.com/source3`;
  }
}
