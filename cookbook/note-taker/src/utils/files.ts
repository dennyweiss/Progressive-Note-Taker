import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import slugifyLib from 'slugify';
import { LayerName } from '../types.js';

/**
 * Layer metadata for frontmatter
 */
export interface LayerMetadata {
  title: string;
  layer: number;
  layerName: LayerName;
  sourceType: string;
  created: string;
  wordCount: number;
  author?: string;
}

/**
 * Slugify a title for use in filenames
 */
export function slugify(title: string): string {
  return slugifyLib(title, {
    lower: true,
    strict: true,
    trim: true,
  });
}

/**
 * Generate a timestamp in YYYYMMDD-HHmmss format
 */
export function generateTimestamp(date?: Date): string {
  const d = date || new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}

/**
 * Generate a filename for a layer
 */
export function generateLayerFilename(
  timestamp: string,
  slug: string,
  level: number
): string {
  return `${timestamp}_${slug}_level-${level}.md`;
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Ignore EEXIST errors
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Generate YAML frontmatter from metadata
 */
function generateFrontmatter(metadata: LayerMetadata): string {
  const lines = [
    '---',
    `title: "${escapeYamlString(metadata.title)}"`,
    `layer: ${metadata.layer}`,
    `layer_name: "${metadata.layerName}"`,
    `source: "${metadata.sourceType}"`,
    `created: "${metadata.created}"`,
    `word_count: ${metadata.wordCount}`,
  ];

  if (metadata.author) {
    lines.push(`author: "${escapeYamlString(metadata.author)}"`);
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}

/**
 * Escape a string for YAML
 */
function escapeYamlString(str: string): string {
  return str.replace(/"/g, '\\"');
}

/**
 * Save a layer to a markdown file
 */
export async function saveLayer(
  directory: string,
  filename: string,
  content: string,
  metadata: LayerMetadata
): Promise<string> {
  // Ensure directory exists
  await ensureDirectory(directory);

  // Generate full path
  const filePath = join(directory, filename);

  // Generate frontmatter
  const frontmatter = generateFrontmatter(metadata);

  // Generate header
  const header = `# L${metadata.layer}: ${metadata.title} - ${metadata.layerName}\n\n`;

  // Combine content
  const fullContent = frontmatter + header + content;

  // Write file
  await writeFile(filePath, fullContent, 'utf-8');

  return filePath;
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Get layer name by level
 */
export function getLayerName(level: number): LayerName {
  const names: Record<number, LayerName> = {
    1: 'Initial Capture',
    2: 'Key Passages',
    3: 'Distilled Insights',
    4: 'Executive Summary',
    5: 'Creative Output',
  };
  return names[level] || 'Initial Capture';
}
