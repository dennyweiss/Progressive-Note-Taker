import { Node } from 'pocketflow';
import { SharedState } from '../types.js';
import { callLlm } from '../utils/index.js';

/**
 * Prep result for Layer 1
 */
interface PrepResult {
  content: string;
  title: string;
  focusArea?: string;
  sourceType: string;
  author?: string;
  date?: string;
}

/**
 * Layer1CaptureNode - Initial resonance-based capture
 *
 * Applies resonance-based selection to capture passages that:
 * - Trigger immediate recognition
 * - Contain surprising insights
 * - Present useful frameworks
 * - Simplify complexity
 */
export class Layer1CaptureNode extends Node<SharedState> {
  /**
   * Prepare: Read content and metadata
   */
  async prep(shared: SharedState): Promise<PrepResult> {
    return {
      content: shared.content.raw,
      title: shared.metadata.title,
      focusArea: shared.input.focusArea,
      sourceType: shared.metadata.sourceType,
      author: shared.metadata.author,
      date: shared.metadata.date,
    };
  }

  /**
   * Execute: Call LLM for resonance-based capture
   */
  async exec(prepRes: PrepResult): Promise<string> {
    console.log('[Layer1] Performing resonance-based capture...');

    const prompt = `You are applying Layer 1 of Tiago Forte's Progressive Summarization method.

## Task: Initial Capture

Select all passages from the content below that resonate or feel potentially useful. Use resonance-based selection—choose content that triggers immediate recognition:
- Surprising insights
- Useful frameworks
- Ideas that simplify complexity
- Anything that makes you think "that's interesting" or "I might need this"

## Content Information
- Title: ${prepRes.title}
${prepRes.author ? `- Author: ${prepRes.author}` : ''}
${prepRes.date ? `- Date: ${prepRes.date}` : ''}
- Source Type: ${prepRes.sourceType}
${prepRes.focusArea ? `- Focus Area: ${prepRes.focusArea}` : ''}

## Guidelines
1. Preserve the original author's language exactly
2. Maintain natural section breaks
3. Include source metadata at the top
4. Be generous in what you capture—this is the broadest layer
5. Trust intuitive responses over analytical criteria

## Content to Process

${prepRes.content}

---

Return the captured content as markdown, preserving structure and formatting. Include everything that resonates, even if uncertain about its value.`;

    return callLlm(prompt, { temperature: 0.3 });
  }

  /**
   * Post: Store Layer 1 result
   */
  async post(
    shared: SharedState,
    _prepRes: PrepResult,
    result: string
  ): Promise<string> {
    shared.layers.layer1 = result;
    console.log('[Layer1] Initial capture complete');
    return 'default';
  }
}
