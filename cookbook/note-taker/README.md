# Progressive Note-Taker

A PocketFlow TypeScript agent that applies Tiago Forte's 5-layer Progressive Summarization method to any content.

## Overview

This agent transforms text, PDFs, images, or web content through five progressive layers of refinement:

1. **Layer 1 - Initial Capture**: Resonance-based selection of all useful content
2. **Layer 2 - Bold Emphasis**: 20-30% key passages highlighted
3. **Layer 3 - Distilled Insights**: 10-15% essential insights, structured
4. **Layer 4 - Executive Summary**: 250-word first-person synthesis
5. **Layer 5 - Creative Output**: Actionable deliverable (checklist, diagram, guide)

## Installation

```bash
cd cookbook/note-taker
npm install
npm run build
```

## Usage

### CLI

```bash
# Process text directly
npm start -- "Your text content here..."

# Process a PDF file
npm start -- ./document.pdf

# Process a URL with focus area
npm start -- https://example.com/article --focus "productivity"

# Specify output directory
npm start -- ./notes.txt --output ./my-notes

# Use different LLM provider
npm start -- ./content.txt -p anthropic -m claude-sonnet-4-20250514
```

### Options

| Option | Short | Description |
|--------|-------|-------------|
| `--output` | `-o` | Output directory (default: ./data/notes) |
| `--focus` | `-f` | Focus area or lens for processing |
| `--format` | | Preferred Layer 5 output format |
| `--provider` | `-p` | LLM provider: openai, anthropic, ollama |
| `--model` | `-m` | Model name |
| `--help` | `-h` | Show help message |

### Programmatic API

```typescript
import { createNoteFlow, createInitialState, setLLMConfig } from 'progressive-note-taker';

// Configure LLM
setLLMConfig({
  provider: 'openai',
  model: 'gpt-4o-mini',
});

// Create initial state
const state = createInitialState('Your content here...', {
  focusArea: 'productivity',
  outputDirectory: './notes',
});

// Run the flow
const flow = createNoteFlow();
await flow.run(state);

// Access results
console.log(state.output.savedFiles);
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | API key for OpenAI |
| `ANTHROPIC_API_KEY` | API key for Anthropic |

## Output

Files are saved with the naming schema:
```
[YYYYMMDD-HHmmss]_[slugified-title]_level-[1-5].md
```

Each file includes YAML frontmatter with metadata:
```yaml
---
title: "Article Title"
layer: 1
layer_name: "Initial Capture"
source: "url"
created: "2024-01-15T14:30:22Z"
word_count: 2500
---
```

## Architecture

```
Input → InputDetector → ContentExtractor → L1 → L2 → L3 → L4 → L5 → FileSaver
           │                   │
           ├── text ──────────┤
           ├── pdf ───────────┤
           ├── image ─────────┤
           └── url ───────────┘
```

## License

MIT
