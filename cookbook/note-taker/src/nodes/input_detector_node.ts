import { Node } from 'pocketflow';
import { SharedState, InputType } from '../types.js';

/**
 * InputDetectorNode - Detects the type of input provided
 *
 * Analyzes the raw input to determine if it's:
 * - text: Plain text content
 * - pdf: Path to a PDF file
 * - image: Path to an image file
 * - url: A valid URL
 *
 * Returns the detected type as an action for routing.
 */
export class InputDetectorNode extends Node<SharedState> {
  /**
   * Prepare: Read raw input from shared state
   */
  async prep(shared: SharedState): Promise<string> {
    return shared.input.raw;
  }

  /**
   * Execute: Detect input type
   */
  async exec(input: string): Promise<InputType> {
    const trimmed = input.trim();

    // Check for URL pattern
    if (this.isUrl(trimmed)) {
      return 'url';
    }

    // Check for PDF file extension
    if (this.isPdfFile(trimmed)) {
      return 'pdf';
    }

    // Check for image file extension
    if (this.isImageFile(trimmed)) {
      return 'image';
    }

    // Default to text
    return 'text';
  }

  /**
   * Post: Store detected type and return as action
   */
  async post(
    shared: SharedState,
    _prepRes: string,
    inputType: InputType
  ): Promise<string> {
    shared.input.type = inputType;
    console.log(`[InputDetector] Detected input type: ${inputType}`);
    return inputType;
  }

  /**
   * Check if input is a valid URL
   */
  private isUrl(input: string): boolean {
    // Must start with http:// or https://
    if (!input.match(/^https?:\/\//i)) {
      return false;
    }

    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if input is a PDF file path
   */
  private isPdfFile(input: string): boolean {
    return input.toLowerCase().endsWith('.pdf');
  }

  /**
   * Check if input is an image file path
   */
  private isImageFile(input: string): boolean {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff'];
    const lower = input.toLowerCase();
    return imageExtensions.some((ext) => lower.endsWith(ext));
  }
}
