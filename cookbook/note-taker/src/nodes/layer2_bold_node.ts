import { Node } from 'pocketflow';
import { SharedState } from '../types.js';
import { callLlm } from '../utils/index.js';

/**
 * Layer2BoldNode - Bold emphasis on key passages
 *
 * Adds **bold formatting** to the most important 20-30% of text:
 * - Core arguments and key claims
 * - Memorable examples
 * - High-information-density sentences
 * - Keywords that serve as memory hooks
 */
export class Layer2BoldNode extends Node<SharedState> {
  /**
   * Prepare: Read Layer 1 content
   */
  async prep(shared: SharedState): Promise<string> {
    return shared.layers.layer1 || '';
  }

  /**
   * Execute: Call LLM to add bold emphasis
   */
  async exec(layer1Content: string): Promise<string> {
    console.log('[Layer2] Adding bold emphasis to key passages...');

    const prompt = `You are applying Layer 2 of Tiago Forte's Progressive Summarization method.

## Task: Bold Emphasis

Take the Layer 1 capture below and add **bold formatting** to the most important 20-30% of the text.

## Selection Criteria for Bolding

Focus on:
1. **Core arguments** - The main claims and conclusions
2. **Key phrases** - Memorable language that captures concepts
3. **High-density sentences** - Passages that pack multiple insights
4. **Memory hooks** - Keywords and phrases that aid recall
5. **Actionable items** - Specific recommendations or steps

## Guidelines

1. Copy the ENTIRE Layer 1 content
2. Add **bold** markers around the most important parts
3. Aim for 20-30% of text to be bolded
4. The bolded portions should form a coherent narrative when read alone
5. Don't change any words—only add bold formatting
6. Preserve all original structure and formatting

## Layer 1 Content

${layer1Content}

---

Return the complete content with bold emphasis added. Do not summarize or remove any content.`;

    return callLlm(prompt, { temperature: 0.3 });
  }

  /**
   * Post: Store Layer 2 result
   */
  async post(
    shared: SharedState,
    _prepRes: string,
    result: string
  ): Promise<string> {
    shared.layers.layer2 = result;
    console.log('[Layer2] Bold emphasis complete');
    return 'default';
  }
}
