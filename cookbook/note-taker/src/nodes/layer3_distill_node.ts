import { Node } from 'pocketflow';
import { SharedState } from '../types.js';
import { callLlm } from '../utils/index.js';

/**
 * Prep result for Layer 3
 */
interface PrepResult {
  layer2: string;
  originalWordCount: number;
}

/**
 * Layer3DistillNode - Distill to essential insights
 *
 * Compresses content to 10-15% of original, containing:
 * - Core Concepts
 * - Key Findings
 * - Actionable Principles
 *
 * Should be scannable in 10-20 seconds.
 */
export class Layer3DistillNode extends Node<SharedState> {
  /**
   * Prepare: Read Layer 2 content and word count
   */
  async prep(shared: SharedState): Promise<PrepResult> {
    return {
      layer2: shared.layers.layer2 || '',
      originalWordCount: shared.metadata.wordCount,
    };
  }

  /**
   * Execute: Call LLM to distill content
   */
  async exec(prepRes: PrepResult): Promise<string> {
    console.log('[Layer3] Distilling to essential insights...');

    const targetWords = Math.round(prepRes.originalWordCount * 0.12);

    const prompt = `You are applying Layer 3 of Tiago Forte's Progressive Summarization method.

## Task: Distill to Essential Insights

Extract only the most transformative insights from the Layer 2 content below. This layer should contain approximately 10-15% of the original content (target: ~${targetWords} words).

## Output Structure

Organize the distilled content with these headers:

### Core Concepts
The fundamental ideas and frameworks

### Key Findings
The most important discoveries or conclusions

### Actionable Principles
Specific guidance that can be applied

## Guidelines

1. Extract only the "gems"—insights that would be highlighted if reviewing Layer 2
2. Reorganize thematically rather than sequentially
3. This layer should be scannable in 10-20 seconds
4. Use bullet points for clarity
5. Each point should stand alone as a valuable insight
6. Preserve exact language where impactful, but condense where possible

## Layer 2 Content (with bold emphasis)

${prepRes.layer2}

---

Return the distilled insights in the structured format above. Be ruthless in compression—only the transformative insights should remain.`;

    return callLlm(prompt, { temperature: 0.4 });
  }

  /**
   * Post: Store Layer 3 result
   */
  async post(
    shared: SharedState,
    _prepRes: PrepResult,
    result: string
  ): Promise<string> {
    shared.layers.layer3 = result;
    console.log('[Layer3] Distillation complete');
    return 'default';
  }
}
