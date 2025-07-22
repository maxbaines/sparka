// research-supervisor.ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type {
  ResearchConfig,
  ResearchPlan,
  ToolResult,
  SupervisorState,
} from './types';
import { IndividualResearcher } from './individual-researcher';

export class ResearchSupervisor {
  constructor(private config: ResearchConfig) {}

  async planResearch(
    brief: string,
    existingFindings: string[],
  ): Promise<ResearchPlan> {
    const { object } = await generateObject({
      model: openai(this.config.models.research),
      schema: z.object({
        isComplete: z.boolean(),
        tasks: z.array(
          z.object({
            id: z.string(),
            topic: z.string(),
            priority: z.number(),
          }),
        ),
      }),
      prompt: `
        You are a research supervisor. Your job is to conduct research by calling the "ConductResearch" tool.

        Research Brief: ${brief}
        Existing Findings: ${existingFindings.join('\n')}
        
        Determine what additional research is needed or if research is complete.
        
        If research is complete, set isComplete to true and return an empty tasks array.
        If more research is needed, provide specific research tasks with topics and priorities (1-5, where 1 is highest priority).
        
        Each task should focus on a specific aspect that needs investigation.
        You can provide up to ${this.config.maxConcurrentResearch} research tasks at once.
        
        Guidelines:
        - Each research task should be substantially different from existing findings
        - Focus on specific, actionable research topics
        - Provide detailed context for each research topic
        - Be cost-conscious - only request research that is absolutely necessary
      `,
    });

    return object;
  }

  async executeTools(
    researchPlan: ResearchPlan,
    state: SupervisorState,
  ): Promise<{
    shouldContinue: boolean;
    newFindings: string[];
    rawNotes: string[];
  }> {
    // Exit criteria check
    const exceededIterations =
      state.researchIterations >= this.config.maxResearchIterations;

    if (
      exceededIterations ||
      researchPlan.isComplete ||
      researchPlan.tasks.length === 0
    ) {
      return {
        shouldContinue: false,
        newFindings: [],
        rawNotes: [],
      };
    }

    try {
      // Limit concurrent research tasks
      const tasksToExecute = researchPlan.tasks.slice(
        0,
        this.config.maxConcurrentResearch,
      );
      const overflowTasks = researchPlan.tasks.slice(
        this.config.maxConcurrentResearch,
      );

      // Execute research tasks in parallel
      const researchPromises = tasksToExecute.map((task) =>
        this.executeIndividualResearch(task.topic, task.id),
      );

      const results = await Promise.all(researchPromises);

      // Handle overflow tasks (tasks beyond the limit)
      const overflowResults = overflowTasks.map((task) => ({
        findings: `Error: Research task "${task.topic}" was not executed because it exceeded the maximum number of concurrent research units (${this.config.maxConcurrentResearch}). Please try again with fewer tasks.`,
        rawNotes: [],
      }));

      const allResults = [...results, ...overflowResults];
      const newFindings = allResults.map((r) => r.findings);
      const rawNotes = allResults.flatMap((r) => r.rawNotes);

      return {
        shouldContinue: true,
        newFindings,
        rawNotes,
      };
    } catch (error) {
      console.error('Error executing research tasks:', error);

      return {
        shouldContinue: false,
        newFindings: [
          `Error executing research: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
        rawNotes: [],
      };
    }
  }

  private async executeIndividualResearch(
    topic: string,
    taskId: string,
  ): Promise<{ findings: string; rawNotes: string[] }> {
    try {
      const researcher = new IndividualResearcher(this.config);
      const session = await researcher.researchWithTools(topic);
      const compressedFindings = await researcher.compressFindings(session);

      return {
        findings: compressedFindings,
        rawNotes: session.toolResults.map((r: ToolResult) => r.result),
      };
    } catch (error) {
      return {
        findings: `Error researching "${topic}": ${error instanceof Error ? error.message : 'Unknown error'}`,
        rawNotes: [],
      };
    }
  }

  async conductSupervisedResearch(
    researchBrief: string,
    initialFindings: string[] = [],
  ): Promise<{ findings: string[]; rawNotes: string[]; isComplete: boolean }> {
    const state: SupervisorState = {
      supervisorMessages: [],
      researchBrief,
      researchIterations: 0,
      findings: [...initialFindings],
      rawNotes: [],
    };

    while (state.researchIterations < this.config.maxResearchIterations) {
      // Plan research based on current state
      const researchPlan = await this.planResearch(
        researchBrief,
        state.findings,
      );

      // Execute research tasks
      const executionResult = await this.executeTools(researchPlan, state);

      if (!executionResult.shouldContinue) {
        return {
          findings: state.findings,
          rawNotes: state.rawNotes,
          isComplete: researchPlan.isComplete,
        };
      }

      // Update state with new findings
      state.findings.push(...executionResult.newFindings);
      state.rawNotes.push(...executionResult.rawNotes);
      state.researchIterations++;
    }

    return {
      findings: state.findings,
      rawNotes: state.rawNotes,
      isComplete: false, // Stopped due to iteration limit
    };
  }
}
