/**
 * Input types supported by the note-taker agent
 */
export type InputType = 'text' | 'pdf' | 'image' | 'url';

/**
 * Layer names for the 5-layer progressive summarization
 */
export type LayerName =
  | 'Initial Capture'
  | 'Key Passages'
  | 'Distilled Insights'
  | 'Executive Summary'
  | 'Creative Output';

/**
 * Shared state passed between all nodes in the flow
 */
export interface SharedState {
  // Input Configuration
  input: {
    raw: string;              // Original input (text content, file path, or URL)
    type?: InputType;         // Detected input type
    focusArea?: string;       // Optional lens for processing
    outputFormat?: string;    // Preferred Layer 5 format
  };

  // Source Metadata
  metadata: {
    title: string;
    author?: string;
    date?: string;
    sourceType: string;
    wordCount: number;
  };

  // Extracted Content
  content: {
    raw: string;              // Full extracted text
    sections?: string[];      // Natural section breaks (optional)
  };

  // Progressive Layers (populated as processed)
  layers: {
    layer1?: string;          // Initial Capture
    layer2?: string;          // Bold Emphasis
    layer3?: string;          // Distilled Insights
    layer4?: string;          // Executive Summary
    layer5?: string;          // Creative Output
  };

  // Output Configuration
  output: {
    directory: string;        // Output folder path
    timestamp?: string;       // Generated timestamp
    slug?: string;            // Slugified title
    savedFiles: string[];     // Paths to saved files
  };
}

/**
 * Layer entry for batch processing in FileSaverNode
 */
export interface LayerEntry {
  level: number;
  name: LayerName;
  content: string;
}

/**
 * LLM provider configuration
 */
export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'ollama';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Application configuration
 */
export interface Config {
  llm: LLMConfig;
  output: {
    directory: string;  // Default: './data/notes'
  };
  processing: {
    maxRetries: number; // Default: 3
    retryWait: number;  // Default: 2 (seconds)
  };
}

/**
 * Default configuration
 */
export const defaultConfig: Config = {
  llm: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 4096,
  },
  output: {
    directory: './data/notes',
  },
  processing: {
    maxRetries: 3,
    retryWait: 2,
  },
};

/**
 * Create initial shared state with defaults
 */
export function createInitialState(
  input: string,
  options?: {
    focusArea?: string;
    outputFormat?: string;
    outputDirectory?: string;
  }
): SharedState {
  return {
    input: {
      raw: input,
      focusArea: options?.focusArea,
      outputFormat: options?.outputFormat,
    },
    metadata: {
      title: '',
      sourceType: '',
      wordCount: 0,
    },
    content: {
      raw: '',
    },
    layers: {},
    output: {
      directory: options?.outputDirectory || './data/notes',
      savedFiles: [],
    },
  };
}
