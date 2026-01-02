# CLAUDE.md - Progressive Note-Taker Agent

> Context and guidelines for developing the PocketFlow TypeScript note-taker agent

## Project Overview

This is a **progressive note-taking agent** built with PocketFlow TypeScript. The agent helps users capture, organize, refine, and retrieve notes through an agentic workflow.

**Project Root**: `./cookbook/note-taker`

## PocketFlow TypeScript Quick Reference

### Core Concepts

- **Node**: Smallest building block with `prep()` → `exec()` → `post()` lifecycle
- **Flow**: Orchestrates directed graph of nodes using Actions (labeled edges)
- **Shared Store**: Global in-memory state dictionary for node communication
- **Params**: Immutable, ephemeral per-node configuration (for batch IDs)

### Node Types

| Type | Use Case |
|------|----------|
| `Node<S, P>` | Single execution with optional retries |
| `BatchNode<S, P>` | Sequential batch processing |
| `ParallelBatchNode<S, P>` | Concurrent batch processing |
| `Flow<S, P>` | Graph orchestration |
| `BatchFlow<S, P>` | Flow repeated with different params |
| `ParallelBatchFlow<S, P>` | Flow iterations run concurrently |

### Node Lifecycle

```typescript
class MyNode extends Node<SharedState> {
  // 1. Read from shared store, prepare data for exec
  async prep(shared: SharedState): Promise<PrepResult> { }

  // 2. Execute logic (LLM calls, APIs) - NO shared access
  async exec(prepRes: PrepResult): Promise<ExecResult> { }

  // 3. Write back to shared, return action for routing
  async post(shared: SharedState, prepRes: PrepResult, execRes: ExecResult): Promise<string> { }
}
```

### Flow Connections

```typescript
nodeA.next(nodeB);           // Default transition
nodeA.on("action", nodeB);   // Named action transition
search.on("decide", decide); // Loop back for agents
```

## Design Patterns to Apply

### Agent Pattern (Primary)
- Use for dynamic decision-making based on user intent
- Implement action space with clear, non-overlapping options
- Enable loop-back for multi-step interactions

### Workflow Pattern
- Break complex tasks into sequential node chains
- Find sweet spot between too coarse and too granular

### Structured Output
- Use YAML over JSON for LLM responses (easier parsing)
- Validate outputs in `post()` before routing

## Development Guidelines

### File Structure
```
note-taker/
├── CLAUDE.md           # This file
├── design.md           # Design document
├── package.json
├── src/
│   ├── index.ts        # Entry point
│   ├── types.ts        # SharedState interface
│   ├── flows/
│   │   └── note_flow.ts
│   ├── nodes/
│   │   ├── index.ts
│   │   └── *.ts        # Individual node files
│   └── utils/
│       └── *.ts        # LLM calls, storage, etc.
└── data/
    └── notes/          # Note storage
```

### Shared State Design Principles
- Design schema ahead of time
- Minimize data redundancy
- Keep state explicit and traceable

### Node Implementation Rules
1. `prep()`: Only read from shared, prepare data
2. `exec()`: Pure computation, no shared access, must be idempotent if retries enabled
3. `post()`: Write to shared, return action string for routing

### Agent Node Best Practices
- Provide minimal, relevant context
- Define unambiguous action space
- Use YAML for structured LLM responses
- Implement graceful fallbacks

## Testing Approach
- Test individual nodes with mock shared state
- Test flow routing with different action outcomes
- Verify agent decision-making with edge cases

## LLM Integration
- Wrap LLM calls in utility functions (e.g., `callLlm()`)
- Handle rate limits with `maxRetries` and `wait` parameters
- Parse YAML responses with error handling

## Commands

```bash
# Install dependencies
npm install

# Run the agent
npm start

# Development mode
npm run dev
```
