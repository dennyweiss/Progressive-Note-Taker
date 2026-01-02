#!/usr/bin/env node

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { createNoteFlow } from './flows/index.js';
import { createInitialState, SharedState, LLMConfig } from './types.js';
import { setLLMConfig } from './utils/index.js';

/**
 * CLI options
 */
interface CLIOptions {
  input: string;
  output?: string;
  focus?: string;
  format?: string;
  provider?: 'openai' | 'anthropic' | 'ollama';
  model?: string;
}

/**
 * Parse command line arguments
 */
function parseArgs(): CLIOptions {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    input: '',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--output':
      case '-o':
        options.output = args[++i];
        break;
      case '--focus':
      case '-f':
        options.focus = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--provider':
      case '-p':
        options.provider = args[++i] as CLIOptions['provider'];
        break;
      case '--model':
      case '-m':
        options.model = args[++i];
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
      default:
        if (!arg.startsWith('-') && !options.input) {
          options.input = arg;
        }
    }
  }

  return options;
}

/**
 * Print help message
 */
function printHelp(): void {
  console.log(`
Progressive Note-Taker - Apply Tiago Forte's 5-layer Progressive Summarization

Usage: npx progressive-note-taker <input> [options]

Input:
  <input>           Text content, file path (.pdf, .png, .jpg), or URL

Options:
  -o, --output      Output directory (default: ./data/notes)
  -f, --focus       Focus area or lens for processing
  --format          Preferred Layer 5 output format
  -p, --provider    LLM provider: openai, anthropic, ollama (default: openai)
  -m, --model       Model name (default: gpt-4o-mini)
  -h, --help        Show this help message

Environment Variables:
  OPENAI_API_KEY    API key for OpenAI
  ANTHROPIC_API_KEY API key for Anthropic

Examples:
  # Process text directly
  npx progressive-note-taker "Your text content here..."

  # Process a PDF file
  npx progressive-note-taker ./document.pdf

  # Process a URL with focus area
  npx progressive-note-taker https://example.com/article --focus "productivity"

  # Use Anthropic Claude
  npx progressive-note-taker ./notes.txt -p anthropic -m claude-sonnet-4-20250514
`);
}

/**
 * Read input from file if it's a file path
 */
async function resolveInput(input: string): Promise<string> {
  // If it looks like a URL, return as-is
  if (input.match(/^https?:\/\//i)) {
    return input;
  }

  // If it looks like a file path, check if we should read it
  // For PDF and images, we pass the path; for text files, we read content
  if (input.match(/\.(pdf|png|jpg|jpeg|gif|bmp|webp|tiff)$/i)) {
    // Return the path for binary files
    return resolve(input);
  }

  // Check if it's a text file
  if (input.match(/\.(txt|md|markdown)$/i)) {
    try {
      const content = await readFile(resolve(input), 'utf-8');
      return content;
    } catch {
      // If file doesn't exist, treat as text
      return input;
    }
  }

  // Check if the input is a valid file path
  try {
    const content = await readFile(resolve(input), 'utf-8');
    return content;
  } catch {
    // Not a file, treat as text content
    return input;
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const options = parseArgs();

  if (!options.input) {
    console.error('Error: No input provided');
    printHelp();
    process.exit(1);
  }

  // Configure LLM
  const llmConfig: Partial<LLMConfig> = {};
  if (options.provider) {
    llmConfig.provider = options.provider;
  }
  if (options.model) {
    llmConfig.model = options.model;
  }
  setLLMConfig(llmConfig);

  console.log('Progressive Note-Taker');
  console.log('======================');
  console.log(`Provider: ${options.provider || 'openai'}`);
  console.log(`Model: ${options.model || 'gpt-4o-mini'}`);
  console.log('');

  try {
    // Resolve input
    const input = await resolveInput(options.input);
    console.log(`Input type detected: ${input.length > 100 ? 'text content' : input}`);

    // Create initial state
    const sharedState: SharedState = createInitialState(input, {
      focusArea: options.focus,
      outputFormat: options.format,
      outputDirectory: options.output || './data/notes',
    });

    // Create and run flow
    const flow = createNoteFlow();

    console.log('\nProcessing...\n');
    await flow.run(sharedState);

    // Output results
    console.log('\n======================');
    console.log('Processing Complete!');
    console.log('======================\n');

    console.log(`Title: ${sharedState.metadata.title}`);
    console.log(`Original Word Count: ${sharedState.metadata.wordCount}`);
    console.log(`Source Type: ${sharedState.metadata.sourceType}`);
    console.log('');

    console.log('Saved Files:');
    for (const file of sharedState.output.savedFiles) {
      console.log(`  - ${file}`);
    }
    console.log('');

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run main
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Export for programmatic use
export { createNoteFlow } from './flows/index.js';
export { createInitialState, SharedState, Config, LLMConfig } from './types.js';
export { setLLMConfig } from './utils/index.js';
export * from './nodes/index.js';
