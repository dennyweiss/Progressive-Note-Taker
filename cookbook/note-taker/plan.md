# Implementation Plan: Progressive Note-Taker Agent

## Overview

Build a PocketFlow TypeScript agent that applies Tiago Forte's 5-layer Progressive Summarization to any input content (text, PDF, image, URL).

## Phase 1: Project Setup

### 1.1 Initialize Project Structure
- [ ] Create `package.json` with dependencies
- [ ] Create `tsconfig.json`
- [ ] Create directory structure:
  ```
  src/
  ├── index.ts
  ├── types.ts
  ├── flows/
  ├── nodes/
  └── utils/
  data/
  └── notes/
  ```

### 1.2 Dependencies
```json
{
  "pocketflow": "^1.0.4",
  "pdf-parse": "^1.1.1",
  "node-fetch": "^3.3.0",
  "yaml": "^2.3.0",
  "slugify": "^1.6.6"
}
```

## Phase 2: Core Types & Utilities

### 2.1 SharedState Interface (`src/types.ts`)
- [ ] Define `SharedState` with input, metadata, content, layers, output sections
- [ ] Define `Config` interface for LLM and output settings
- [ ] Define `LayerEntry` type for batch processing

### 2.2 Utility Functions

#### `src/utils/llm.ts`
- [ ] Create `callLlm(prompt, options)` wrapper
- [ ] Support configurable provider (OpenAI, Anthropic, Ollama)
- [ ] Handle errors and retries

#### `src/utils/extractors.ts`
- [ ] `extractFromText(input)` - pass-through
- [ ] `extractFromPDF(filePath)` - pdf-parse integration
- [ ] `extractFromImage(filePath)` - OCR placeholder
- [ ] `extractFromURL(url)` - fetch and convert HTML to text

#### `src/utils/files.ts`
- [ ] `slugify(title)` - URL-safe slug generation
- [ ] `generateTimestamp()` - YYYYMMDD-HHmmss format
- [ ] `saveLayer(path, content, metadata)` - write markdown with frontmatter
- [ ] `ensureDirectory(path)` - create directory if needed

#### `src/utils/yaml.ts`
- [ ] `parseYamlFromLLM(response)` - extract and parse YAML blocks

## Phase 3: Node Implementation

### 3.1 Input Detection (`src/nodes/input_detector_node.ts`)
- [ ] Implement `InputDetectorNode extends Node<SharedState>`
- [ ] `prep()`: Read raw input
- [ ] `exec()`: Pattern matching for type detection
- [ ] `post()`: Set type, return action string

### 3.2 Content Extraction (`src/nodes/content_extractor_node.ts`)
- [ ] Implement `ContentExtractorNode extends Node<SharedState>`
- [ ] `prep()`: Read input type and raw value
- [ ] `exec()`: Route to appropriate extractor
- [ ] `post()`: Store content, generate metadata, init output config

### 3.3 Layer 1 - Capture (`src/nodes/layer1_capture_node.ts`)
- [ ] Implement `Layer1CaptureNode extends Node<SharedState>`
- [ ] Resonance-based selection prompt
- [ ] Preserve original language and sections

### 3.4 Layer 2 - Bold (`src/nodes/layer2_bold_node.ts`)
- [ ] Implement `Layer2BoldNode extends Node<SharedState>`
- [ ] Bold emphasis prompt (20-30% key passages)
- [ ] Memory hooks and coherent narrative

### 3.5 Layer 3 - Distill (`src/nodes/layer3_distill_node.ts`)
- [ ] Implement `Layer3DistillNode extends Node<SharedState>`
- [ ] Compression to 10-15% of original
- [ ] Structured headers (Core Concepts, Key Findings, Actionable Principles)

### 3.6 Layer 4 - Summary (`src/nodes/layer4_summary_node.ts`)
- [ ] Implement `Layer4SummaryNode extends Node<SharedState>`
- [ ] First-person voice transformation
- [ ] 250-word limit with structured sections

### 3.7 Layer 5 - Creative (`src/nodes/layer5_creative_node.ts`)
- [ ] Implement `Layer5CreativeNode extends Node<SharedState>`
- [ ] Auto-detect or user-specified output format
- [ ] Original value generation

### 3.8 File Saver (`src/nodes/file_saver_node.ts`)
- [ ] Implement `FileSaverNode extends BatchNode<SharedState>`
- [ ] Iterate over 5 layers
- [ ] Generate filenames with timestamp and slug
- [ ] Add frontmatter metadata

### 3.9 Node Index (`src/nodes/index.ts`)
- [ ] Export all nodes

## Phase 4: Flow Assembly

### 4.1 Main Flow (`src/flows/note_flow.ts`)
- [ ] Import all nodes
- [ ] Connect input detection routing
- [ ] Connect sequential Layer 1-5 pipeline
- [ ] Connect file saver
- [ ] Export `progressiveNoteFlow`

### 4.2 Entry Point (`src/index.ts`)
- [ ] Parse CLI arguments or config
- [ ] Initialize shared state
- [ ] Run flow
- [ ] Output results summary

## Phase 5: Testing & Refinement

### 5.1 Unit Tests
- [ ] Test each extractor utility
- [ ] Test file naming utilities
- [ ] Test YAML parsing

### 5.2 Integration Tests
- [ ] Test full flow with text input
- [ ] Test full flow with URL input
- [ ] Test full flow with PDF input

### 5.3 Prompt Refinement
- [ ] Tune Layer 1 resonance detection
- [ ] Tune Layer 2 bold percentage
- [ ] Tune Layer 3 compression ratio
- [ ] Tune Layer 4 voice transformation
- [ ] Tune Layer 5 creative outputs

## Node Connection Diagram

```
InputDetectorNode
    │
    ├── 'text' ──┐
    ├── 'pdf' ───┼──→ ContentExtractorNode
    ├── 'image' ─┤            │
    └── 'url' ───┘            ▼
                       Layer1CaptureNode
                              │
                              ▼
                       Layer2BoldNode
                              │
                              ▼
                       Layer3DistillNode
                              │
                              ▼
                       Layer4SummaryNode
                              │
                              ▼
                       Layer5CreativeNode
                              │
                              ▼
                       FileSaverNode (BatchNode)
                              │
                              ▼
                         [5 .md files]
```

## File Naming Schema

```
[YYYYMMDD-HHmmss]_[slugified-title]_level-[1-5].md

Example:
20240115-143022_atomic-habits_level-1.md
20240115-143022_atomic-habits_level-2.md
20240115-143022_atomic-habits_level-3.md
20240115-143022_atomic-habits_level-4.md
20240115-143022_atomic-habits_level-5.md
```

## Success Criteria

1. Accept text, PDF, image, and URL inputs
2. Produce 5 progressive summarization layers
3. Each layer correctly applies the methodology:
   - L1: Full resonance capture
   - L2: 20-30% bolded
   - L3: 10-15% of original, scannable in 20 seconds
   - L4: 250-word first-person summary
   - L5: Creative original output
4. Files saved with correct naming schema
5. Metadata preserved in frontmatter
