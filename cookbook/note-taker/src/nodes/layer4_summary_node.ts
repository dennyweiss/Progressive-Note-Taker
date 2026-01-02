import { Node } from 'pocketflow';
import { SharedState } from '../types.js';
import { callLlm } from '../utils/index.js';

/**
 * Prep result for Layer 4
 */
interface PrepResult {
  layer3: string;
  title: string;
  author?: string;
}

/**
 * Layer4SummaryNode - Executive summary in first-person
 *
 * Creates a personal synthesis:
 * - The Big Idea (1-2 sentences)
 * - What This Means (personal interpretation)
 * - Three Key Takeaways (bulleted)
 * - Next Actions (specific applications)
 *
 * Maximum 250 words.
 */
export class Layer4SummaryNode extends Node<SharedState> {
  /**
   * Prepare: Read Layer 3 content and metadata
   */
  async prep(shared: SharedState): Promise<PrepResult> {
    return {
      layer3: shared.layers.layer3 || '',
      title: shared.metadata.title,
      author: shared.metadata.author,
    };
  }

  /**
   * Execute: Call LLM to create executive summary
   */
  async exec(prepRes: PrepResult): Promise<string> {
    console.log('[Layer4] Creating executive summary...');

    const prompt = `You are applying Layer 4 of Tiago Forte's Progressive Summarization method.

## Task: Executive Summary

Create a personal synthesis of the insights below. Write in first-person perspective, as if explaining this to yourself for future reference.

## Source
- Title: "${prepRes.title}"
${prepRes.author ? `- Author: ${prepRes.author}` : ''}

## Output Structure (Maximum 250 words total)

### The Big Idea
1-2 sentences capturing the central insight

### What This Means
A personal interpretation—what makes this significant to me

### Key Takeaways
- First key point
- Second key point
- Third key point

### Next Actions
Specific ways I can apply these insights

## Guidelines

1. Write in first person ("I learned...", "This means I should...")
2. Use your own language, not the author's
3. Transform concepts into your mental models
4. Be specific about applications
5. Make it personal and actionable
6. Stay under 250 words

## Layer 3 Insights

${prepRes.layer3}

---

Return the executive summary in the structured format above. This should sound like your own voice, not a formal summary.`;

    return callLlm(prompt, { temperature: 0.6 });
  }

  /**
   * Post: Store Layer 4 result
   */
  async post(
    shared: SharedState,
    _prepRes: PrepResult,
    result: string
  ): Promise<string> {
    shared.layers.layer4 = result;
    console.log('[Layer4] Executive summary complete');
    return 'default';
  }
}
