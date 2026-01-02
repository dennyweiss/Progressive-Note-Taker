import { BatchNode } from 'pocketflow';
import { SharedState, LayerEntry, LayerName } from '../types.js';
import {
  saveLayer,
  generateLayerFilename,
  getLayerName,
  countWords,
  LayerMetadata,
} from '../utils/index.js';

/**
 * Layer configuration for saving
 */
interface LayerConfig {
  level: number;
  name: LayerName;
  key: keyof SharedState['layers'];
}

/**
 * FileSaverNode - Saves all layers as separate markdown files
 *
 * Uses BatchNode to iterate over 5 layers and save each:
 * - Generates filename with timestamp and slug
 * - Adds YAML frontmatter with metadata
 * - Tracks saved file paths
 */
export class FileSaverNode extends BatchNode<SharedState> {
  private readonly layerConfigs: LayerConfig[] = [
    { level: 1, name: 'Initial Capture', key: 'layer1' },
    { level: 2, name: 'Key Passages', key: 'layer2' },
    { level: 3, name: 'Distilled Insights', key: 'layer3' },
    { level: 4, name: 'Executive Summary', key: 'layer4' },
    { level: 5, name: 'Creative Output', key: 'layer5' },
  ];

  /**
   * Prepare: Return array of layer entries to save
   */
  async prep(shared: SharedState): Promise<LayerEntry[]> {
    const entries: LayerEntry[] = [];

    for (const config of this.layerConfigs) {
      const content = shared.layers[config.key];
      if (content) {
        entries.push({
          level: config.level,
          name: config.name,
          content,
        });
      }
    }

    console.log(`[FileSaver] Preparing to save ${entries.length} layers`);
    return entries;
  }

  /**
   * Execute: Save a single layer file
   * Note: We need shared for metadata, so we pass via closure
   */
  async exec(entry: LayerEntry): Promise<string> {
    // This will be called for each layer
    // Return the entry as JSON to process in post
    return JSON.stringify(entry);
  }

  /**
   * Post: Save all layers and collect file paths
   */
  async post(
    shared: SharedState,
    entries: LayerEntry[],
    _results: string[]
  ): Promise<string> {
    console.log('[FileSaver] Saving layer files...');

    const savedFiles: string[] = [];
    const timestamp = shared.output.timestamp || '';
    const slug = shared.output.slug || 'untitled';
    const directory = shared.output.directory;

    for (const entry of entries) {
      const filename = generateLayerFilename(timestamp, slug, entry.level);

      const metadata: LayerMetadata = {
        title: shared.metadata.title,
        layer: entry.level,
        layerName: entry.name,
        sourceType: shared.metadata.sourceType,
        created: new Date().toISOString(),
        wordCount: countWords(entry.content),
        author: shared.metadata.author,
      };

      const filePath = await saveLayer(
        directory,
        filename,
        entry.content,
        metadata
      );

      savedFiles.push(filePath);
      console.log(`[FileSaver] Saved: ${filename}`);
    }

    shared.output.savedFiles = savedFiles;

    console.log(`[FileSaver] Successfully saved ${savedFiles.length} files`);
    return 'default';
  }
}
