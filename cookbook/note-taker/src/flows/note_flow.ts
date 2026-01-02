import { Flow } from 'pocketflow';
import { SharedState } from '../types.js';
import {
  InputDetectorNode,
  ContentExtractorNode,
  Layer1CaptureNode,
  Layer2BoldNode,
  Layer3DistillNode,
  Layer4SummaryNode,
  Layer5CreativeNode,
  FileSaverNode,
} from '../nodes/index.js';

/**
 * Create the Progressive Note-Taker flow
 *
 * Flow structure:
 * InputDetector → ContentExtractor → Layer1 → Layer2 → Layer3 → Layer4 → Layer5 → FileSaver
 *
 * Input routing:
 * - text → ContentExtractor
 * - pdf → ContentExtractor
 * - image → ContentExtractor
 * - url → ContentExtractor
 */
export function createNoteFlow(): Flow<SharedState> {
  // Create node instances
  const inputDetector = new InputDetectorNode();
  const contentExtractor = new ContentExtractorNode();
  const layer1 = new Layer1CaptureNode();
  const layer2 = new Layer2BoldNode();
  const layer3 = new Layer3DistillNode();
  const layer4 = new Layer4SummaryNode();
  const layer5 = new Layer5CreativeNode();
  const fileSaver = new FileSaverNode();

  // Connect input detection to content extraction
  // All input types route to the same extractor
  inputDetector.on('text', contentExtractor);
  inputDetector.on('pdf', contentExtractor);
  inputDetector.on('image', contentExtractor);
  inputDetector.on('url', contentExtractor);

  // Connect sequential layer pipeline
  contentExtractor.next(layer1);
  layer1.next(layer2);
  layer2.next(layer3);
  layer3.next(layer4);
  layer4.next(layer5);
  layer5.next(fileSaver);

  // Create and return the flow starting from input detector
  return new Flow<SharedState>(inputDetector);
}

/**
 * Pre-configured flow instance
 */
export const progressiveNoteFlow = createNoteFlow();
