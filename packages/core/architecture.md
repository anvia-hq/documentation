# Architecture

Core is a dependency-injected runtime rather than a container that owns the surrounding application.

```text
Application composition
├── provider model
├── tools and permissions
├── memory / vector / event stores
├── observers and policies
└── agent, completion, or pipeline
          ↓
       Core runtime
          ↓
 typed response or semantic event stream
```

## Contracts at the edges

Provider packages implement `CompletionModel`, `EmbeddingModel`, and media model interfaces. Infrastructure packages implement contracts such as `MemoryStore` and `VectorSearchIndex`. Observability adapters implement agent observer contracts.

This keeps credentials, storage clients, and vendor configuration in application composition code. Core receives already-constructed dependencies and coordinates them.

## Agent construction and execution

`AgentBuilder` records reusable configuration and produces an `Agent`. Calling `agent.prompt(...)` creates a one-shot `PromptRequest`; it does not execute until `send()`, `stream()`, or `readableStream()` is consumed.

The prompt request owns one run. It applies request-level overrides, retrieves dynamic context and tools, performs model turns, executes application tools, records memory and events, calls observers, and enforces the turn limit. An `AgentSession` adds a stable memory context around repeated prompt requests.

## Message and event boundaries

Core `Message` objects are the model-facing transcript. `UIMessage` objects preserve client presentation parts and metadata. Conversion is explicit through `@anvia/core/ui`; provider requests receive Core messages rather than UI-only structure.

Agent streams are semantic events, not raw provider chunks. Core combines provider deltas with run, generation, tool, usage, child-agent, and terminal events so transports and observers can understand the entire run.

## Public entry points

The root entry point favors common application authoring. Capability subpaths expose larger contracts without forcing every advanced symbol into the root. `@anvia/core/internal/agent` is exported for Anvia integration packages; normal application code should prefer `@anvia/core/agent`.

See [configuration](/packages/core/configuration), [runtime lifecycle](/packages/core/runtime-lifecycle), and [the API reference](/packages/core/api-reference).
