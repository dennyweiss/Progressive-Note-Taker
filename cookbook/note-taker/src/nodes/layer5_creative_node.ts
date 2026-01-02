import { Node } from 'pocketflow';
import { SharedState } from '../types.js';
import { callLlm } from '../utils/index.js';

/**
 * Prep result for Layer 5
 */
interface PrepResult {
  layer3: string;
  layer4: string;
  title: string;
  outputFormat?: string;
  sourceType: string;
}

/**
 * Layer5CreativeNode - Creative output transformation
 *
 * Transforms insights into a deliverable:
 * - Technical content → Implementation checklist
 * - Conceptual content → Visual framework (Mermaid)
 * - Process content → Step-by-step guide
 * - Research content → Article outline
 *
 * Or user-specified format.
 */
export class Layer5CreativeNode extends Node<SharedState> {
  /**
   * Prepare: Read Layer 3, Layer 4, and format preference
   */
  async prep(shared: SharedState): Promise<PrepResult> {
    return {
      layer3: shared.layers.layer3 || '',
      layer4: shared.layers.layer4 || '',
      title: shared.metadata.title,
      outputFormat: shared.input.outputFormat,
      sourceType: shared.metadata.sourceType,
    };
  }

  /**
   * Execute: Call LLM to create creative output
   */
  async exec(prepRes: PrepResult): Promise<string> {
    console.log('[Layer5] Creating creative output...');

    const formatInstruction = prepRes.outputFormat
      ? `Create a ${prepRes.outputFormat}.`
      : `Auto-detect the best format based on content type:
- Technical/coding content → Implementation checklist with code snippets
- Conceptual/theoretical content → Visual framework diagram (Mermaid)
- Process/workflow content → Step-by-step implementation guide
- Research/academic content → Article or presentation outline`;

    const prompt = `You are applying Layer 5 of Tiago Forte's Progressive Summarization method.

## Task: Creative Output

Transform the insights into an original, actionable deliverable that extends beyond summarization.

## Source
- Title: "${prepRes.title}"
- Original Type: ${prepRes.sourceType}

## Format
${formatInstruction}

## Requirements

1. **Add Original Value**: Don't just reorganize—create something new
2. **Make It Actionable**: The output should be immediately usable
3. **Include Examples**: Add new examples or applications not in the original
4. **Show Connections**: Link ideas to other concepts or domains
5. **Be Creative**: This is your chance to extend the material

## Possible Output Types

### If Implementation Checklist:
- [ ] Step-by-step tasks
- Include specific commands or code
- Add verification steps

### If Mermaid Diagram:
\`\`\`mermaid
flowchart TD / mindmap / etc.
\`\`\`
- Visualize relationships
- Show hierarchy or flow

### If Step-by-Step Guide:
1. Clear numbered steps
2. Include decision points
3. Add tips and warnings

### If Article Outline:
- Compelling sections
- Key points per section
- Suggested examples

## Layer 3 (Distilled Insights)

${prepRes.layer3}

## Layer 4 (Executive Summary)

${prepRes.layer4}

---

Create the most appropriate creative output that transforms these insights into immediate value. The output should be something the reader can use right away.`;

    return callLlm(prompt, { temperature: 0.7 });
  }

  /**
   * Post: Store Layer 5 result
   */
  async post(
    shared: SharedState,
    _prepRes: PrepResult,
    result: string
  ): Promise<string> {
    shared.layers.layer5 = result;
    console.log('[Layer5] Creative output complete');
    return 'default';
  }
}
