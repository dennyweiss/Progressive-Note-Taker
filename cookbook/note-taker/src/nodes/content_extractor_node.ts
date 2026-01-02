import { Node } from 'pocketflow';
import { SharedState, InputType } from '../types.js';
import {
  extractFromText,
  extractFromPDF,
  extractFromImage,
  extractFromURL,
  ExtractionResult,
  slugify,
  generateTimestamp,
} from '../utils/index.js';

/**
 * Prep result containing input info
 */
interface PrepResult {
  raw: string;
  type: InputType;
}

/**
 * ContentExtractorNode - Extracts text content based on input type
 *
 * Routes to appropriate extractor based on detected type:
 * - text: Pass-through
 * - pdf: PDF parsing
 * - image: OCR extraction
 * - url: Web page fetching
 */
export class ContentExtractorNode extends Node<SharedState> {
  /**
   * Prepare: Read input type and raw value
   */
  async prep(shared: SharedState): Promise<PrepResult> {
    return {
      raw: shared.input.raw,
      type: shared.input.type || 'text',
    };
  }

  /**
   * Execute: Route to appropriate extractor
   */
  async exec(prepRes: PrepResult): Promise<ExtractionResult> {
    const { raw, type } = prepRes;

    console.log(`[ContentExtractor] Extracting content from ${type} input...`);

    switch (type) {
      case 'pdf':
        return extractFromPDF(raw);
      case 'image':
        return extractFromImage(raw);
      case 'url':
        return extractFromURL(raw);
      case 'text':
      default:
        return extractFromText(raw);
    }
  }

  /**
   * Post: Store extracted content and initialize output config
   */
  async post(
    shared: SharedState,
    _prepRes: PrepResult,
    result: ExtractionResult
  ): Promise<string> {
    // Store extracted content
    shared.content.raw = result.content;

    // Store metadata
    shared.metadata = {
      title: result.metadata.title || 'Untitled',
      author: result.metadata.author,
      date: result.metadata.date,
      sourceType: shared.input.type || 'text',
      wordCount: result.metadata.wordCount,
    };

    // Initialize output configuration
    shared.output.timestamp = generateTimestamp();
    shared.output.slug = slugify(shared.metadata.title);

    console.log(`[ContentExtractor] Extracted ${shared.metadata.wordCount} words`);
    console.log(`[ContentExtractor] Title: "${shared.metadata.title}"`);

    return 'default';
  }
}
