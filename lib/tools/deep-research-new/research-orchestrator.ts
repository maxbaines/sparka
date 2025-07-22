// research-orchestrator.ts
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import type { ResearchConfig, ResearchState } from './types';
import { ResearchSupervisor } from './research-supervisor';

export class ResearchOrchestrator {
  constructor(private config: ResearchConfig) {}

  async conductResearch(userInput: string): Promise<string> {
    const state: ResearchState = {
      messages: [{ role: 'user', content: userInput }],
      findings: [],
      isComplete: false,
    };

    // Phase 1: Clarification
    if (this.config.allowClarification) {
      const clarificationResult = await this.clarifyWithUser(state);
      if (clarificationResult.needsClarification) {
        return clarificationResult.question;
      }
    }

    // Phase 2: Generate Research Brief
    const researchBrief = await this.generateResearchBrief(state);
    state.researchBrief = researchBrief;

    // Phase 3: Supervised Research
    await this.conductSupervisedResearch(state);

    // Phase 4: Generate Final Report
    return await this.generateFinalReport(state);
  }

  private async clarifyWithUser(state: ResearchState) {
    const { object } = await generateObject({
      model: openai(this.config.models.research),
      schema: z.object({
        needsClarification: z.boolean(),
        question: z.string(),
        verification: z.string(),
      }),
      prompt: `These are the messages that have been exchanged so far from the user asking for the report:
<Messages>
${JSON.stringify(state.messages)}
</Messages>

Assess whether you need to ask a clarifying question, or if the user has already provided enough information for you to start research.
IMPORTANT: If you can see in the messages history that you have already asked a clarifying question, you almost always do not need to ask another one. Only ask another question if ABSOLUTELY NECESSARY.

If there are acronyms, abbreviations, or unknown terms, ask the user to clarify.
If you need to ask a question, follow these guidelines:
- Be concise while gathering all necessary information
- Make sure to gather all the information needed to carry out the research task in a concise, well-structured manner.
- Use bullet points or numbered lists if appropriate for clarity. Make sure that this uses markdown formatting and will be rendered correctly if the string output is passed to a markdown renderer.
- Don't ask for unnecessary information, or information that the user has already provided. If you can see that the user has already provided the information, do not ask for it again.

If you need to ask a clarifying question, set need_clarification to true and provide your question.
If you do not need to ask a clarifying question, set need_clarification to false and provide a verification message that you will now start research.`,
    });

    return {
      needsClarification: object.needsClarification,
      question: object.question,
    };
  }

  private async generateResearchBrief(state: ResearchState): Promise<string> {
    const { object } = await generateObject({
      model: openai(this.config.models.research),
      schema: z.object({
        researchBrief: z.string(),
      }),
      prompt: `You will be given a set of messages that have been exchanged so far between yourself and the user. 
Your job is to translate these messages into a more detailed and concrete research question that will be used to guide the research.

The messages that have been exchanged so far between yourself and the user are:
<Messages>
${JSON.stringify(state.messages)}
</Messages>

You will return a single research question that will be used to guide the research.

Guidelines:
1. Maximize Specificity and Detail
- Include all known user preferences and explicitly list key attributes or dimensions to consider.
- It is important that all details from the user are included in the instructions.

2. Fill in Unstated But Necessary Dimensions as Open-Ended
- If certain attributes are essential for a meaningful output but the user has not provided them, explicitly state that they are open-ended or default to no specific constraint.

3. Avoid Unwarranted Assumptions
- If the user has not provided a particular detail, do not invent one.
- Instead, state the lack of specification and guide the researcher to treat it as flexible or accept all possible options.

4. Use the First Person
- Phrase the request from the perspective of the user.

5. Sources
- If specific sources should be prioritized, specify them in the research question.
- For product and travel research, prefer linking directly to official or primary websites (e.g., official brand sites, manufacturer pages, or reputable e-commerce platforms like Amazon for user reviews) rather than aggregator sites or SEO-heavy blogs.
- For academic or scientific queries, prefer linking directly to the original paper or official journal publication rather than survey papers or secondary summaries.
- For people, try linking directly to their LinkedIn profile, or their personal website if they have one.`,
    });

    return object.researchBrief;
  }

  private async conductSupervisedResearch(state: ResearchState): Promise<void> {
    if (!state.researchBrief) {
      throw new Error('Research brief is required for supervised research');
    }

    const supervisor = new ResearchSupervisor(this.config);
    const result = await supervisor.conductSupervisedResearch(
      state.researchBrief,
      state.findings,
    );

    // Update state with research results
    state.findings = result.findings;
    state.rawNotes = result.rawNotes;
    state.isComplete = result.isComplete;
  }

  private async generateFinalReport(state: ResearchState): Promise<string> {
    const { text } = await generateText({
      model: openai(this.config.models.finalReport),
      prompt: `Based on all the research conducted, create a comprehensive, well-structured answer to the overall research brief:

<Research Brief>
${state.researchBrief}
</Research Brief>

Here are the findings from the research that you conducted:
<Findings>
${state.findings.join('\n\n')}
</Findings>

Please create a detailed answer to the overall research brief that:
1. Is well-organized with proper headings (# for title, ## for sections, ### for subsections)
2. Includes specific facts and insights from the research
3. References relevant sources using [Title](URL) format
4. Provides a balanced, thorough analysis. Be as comprehensive as possible, and include all information that is relevant to the overall research question. People are using you for deep research and will expect detailed, comprehensive answers.
5. Includes a "Sources" section at the end with all referenced links

Format the report in clear markdown with proper structure and include source references where appropriate.

<Citation Rules>
- Assign each unique URL a single citation number in your text
- End with ### Sources that lists each source with corresponding numbers
- IMPORTANT: Number sources sequentially without gaps (1,2,3,4...) in the final list regardless of which sources you choose
- Each source should be a separate line item in a list, so that in markdown it is rendered as a list.
- Example format:
  [1] Source Title: URL
  [2] Source Title: URL
- Citations are extremely important. Make sure to include these, and pay a lot of attention to getting these right. Users will often use these citations to look into more information.
</Citation Rules>`,
    });

    return text;
  }
}
