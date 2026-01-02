import { readFile } from 'fs/promises';
import { InputType } from '../types.js';

/**
 * Result from content extraction
 */
export interface ExtractionResult {
  content: string;
  metadata: {
    title?: string;
    author?: string;
    date?: string;
    wordCount: number;
  };
}

/**
 * Extract content from plain text (pass-through)
 */
export async function extractFromText(input: string): Promise<ExtractionResult> {
  const wordCount = countWords(input);
  const title = extractTitleFromText(input);

  return {
    content: input,
    metadata: {
      title,
      wordCount,
    },
  };
}

/**
 * Extract content from a PDF file
 */
export async function extractFromPDF(filePath: string): Promise<ExtractionResult> {
  try {
    // Dynamic import for pdf-parse (CommonJS module)
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await readFile(filePath);
    const data = await pdfParse(buffer);

    const content = data.text;
    const wordCount = countWords(content);

    return {
      content,
      metadata: {
        title: data.info?.Title || extractTitleFromPath(filePath),
        author: data.info?.Author,
        wordCount,
      },
    };
  } catch (error) {
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Extract content from an image file using OCR
 * Note: This is a placeholder - requires tesseract.js or cloud OCR API
 */
export async function extractFromImage(filePath: string): Promise<ExtractionResult> {
  // Placeholder implementation
  // In production, integrate with tesseract.js or a cloud OCR service
  console.warn('Image OCR not fully implemented. Using placeholder.');

  return {
    content: `[Image content from: ${filePath}]\n\nNote: OCR extraction requires tesseract.js or cloud OCR integration.`,
    metadata: {
      title: extractTitleFromPath(filePath),
      wordCount: 0,
    },
  };
}

/**
 * Extract content from a URL
 */
export async function extractFromURL(url: string): Promise<ExtractionResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ProgressiveNoteTaker/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const content = htmlToText(html);
    const wordCount = countWords(content);
    const title = extractTitleFromHTML(html) || extractTitleFromURL(url);

    return {
      content,
      metadata: {
        title,
        date: new Date().toISOString(),
        wordCount,
      },
    };
  } catch (error) {
    throw new Error(`Failed to fetch URL content: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Convert HTML to plain text (simple implementation)
 */
function htmlToText(html: string): string {
  // Remove script and style elements
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Convert common block elements to newlines
  text = text.replace(/<\/?(p|div|br|h[1-6]|li|tr|blockquote)[^>]*>/gi, '\n');

  // Remove remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = decodeHTMLEntities(text);

  // Normalize whitespace
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.trim();

  return text;
}

/**
 * Decode common HTML entities
 */
function decodeHTMLEntities(text: string): string {
  const entities: Record<string, string> = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }

  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
  result = result.replace(/&#x([a-fA-F0-9]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return result;
}

/**
 * Extract title from HTML
 */
function extractTitleFromHTML(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match) {
    return decodeHTMLEntities(match[1].trim());
  }

  // Try og:title
  const ogMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch) {
    return decodeHTMLEntities(ogMatch[1].trim());
  }

  // Try first h1
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return decodeHTMLEntities(h1Match[1].trim());
  }

  return undefined;
}

/**
 * Extract title from URL
 */
function extractTitleFromURL(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      return lastPart
        .replace(/[-_]/g, ' ')
        .replace(/\.[^.]+$/, '') // Remove extension
        .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize
    }
    return urlObj.hostname;
  } catch {
    return 'Untitled';
  }
}

/**
 * Extract title from file path
 */
function extractTitleFromPath(filePath: string): string {
  const fileName = filePath.split('/').pop() || filePath;
  return fileName
    .replace(/\.[^.]+$/, '') // Remove extension
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Capitalize
}

/**
 * Extract title from text content (first line or heading)
 */
function extractTitleFromText(text: string): string {
  const lines = text.trim().split('\n');
  const firstLine = lines[0]?.trim() || 'Untitled';

  // If first line looks like a heading, use it
  if (firstLine.startsWith('#')) {
    return firstLine.replace(/^#+\s*/, '');
  }

  // Use first line if short enough
  if (firstLine.length <= 100) {
    return firstLine;
  }

  // Truncate long first lines
  return firstLine.substring(0, 97) + '...';
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
