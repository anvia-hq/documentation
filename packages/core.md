# `@anvia/core`

`@anvia/core` is Anvia's provider-neutral runtime. It owns agents, direct completions, typed tools, memory contracts, retrieval, pipelines, streaming events, guardrails, skills, MCP connections, evaluations, and the shared message types used by the rest of the SDK.

Use it when application code should describe agent behavior without depending on one model provider. Provider packages such as `@anvia/openai`, `@anvia/anthropic`, and `@anvia/gemini` supply the runnable model objects.

## Install

```sh
pnpm add @anvia/core zod
```

`zod` is a direct dependency of Core, but application code normally imports it when defining tool inputs and structured outputs.

## Build a useful agent

```ts
import { AgentBuilder, createTool } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const model = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
}).completionModel('gpt-5')

const lookupOrder = createTool({
  name: 'lookup_order',
  description: 'Look up an order by id.',
  input: z.object({ orderId: z.string() }),
  execute: async ({ orderId }) => ({
    orderId,
    status: 'processing',
  }),
})

const supportAgent = new AgentBuilder('support', model)
  .instructions('Help customers understand their order status.')
  .tool(lookupOrder)
  .defaultMaxTurns(4)
  .build()

const response = await supportAgent
  .prompt('What is happening with order A123?')
  .send()

console.log(response.output)
```

The model, credentials, business data, permissions, storage, and deployment remain application-owned. Core coordinates the run around dependencies supplied by the application.

## Key features

| Capability | Primary entry point | Use it for |
| --- | --- | --- |
| Agents | `@anvia/core/agent` | Stateful model-and-tool loops with instructions and runtime policy |
| Completions | `@anvia/core/completion` | Direct model requests, streaming, messages, and parsed results |
| Tools | `@anvia/core/tool` | Typed tools, middleware, approvals, tool sets, and dynamic discovery |
| Memory | `@anvia/core/memory` | Conversation persistence and compaction contracts |
| Retrieval | `@anvia/core/embeddings`, `@anvia/core/vector-store` | Embedding documents and searching vector indexes |
| Pipelines | `@anvia/core/pipeline` | Typed multi-stage workflows, batches, graphs, and run events |
| Media | `@anvia/core/image-generation`, `@anvia/core/audio-generation`, `@anvia/core/transcription` | Provider-neutral media requests |
| Runtime control | `@anvia/core/hooks`, `@anvia/core/guardrails` | Intercepting runs and enforcing input/output policy |
| Integration | `@anvia/core/mcp`, `@anvia/core/skills`, `@anvia/core/observability` | External tools, reusable instructions, and run telemetry |
| Evaluation | `@anvia/core/evals` | Typed evaluation suites, metrics, reporters, and CLI output |

The root `@anvia/core` entry point re-exports the most common agent, completion, tool, hook, memory, guardrail, and UI-stream APIs. Prefer a capability subpath when it makes ownership clearer or when the symbol is not available from the root.

## Common patterns

### Inject provider models

Create provider clients near the server boundary, then pass their completion, embedding, or media models into Core. This keeps credentials and provider-specific configuration outside agent definitions.

### Use direct completions for one model call

Choose `createCompletion` or `createParsedCompletion` when a workflow does not need agent turns or tool execution. See [Completions](/sdk/completions) and [Structured output](/sdk/structured-output).

### Keep persistence behind contracts

Agents accept `MemoryStore`, `AgentEventStore`, and `VectorSearchIndex` implementations. Start with an in-memory implementation during development, then replace it with the adapter that matches production storage. See [Memory](/sdk/memory) and [Knowledges](/sdk/knowledges).

### Keep tool authorization in the application

Schemas validate model-produced arguments; they do not authorize a user or tenant. Enforce permissions inside the tool or middleware before accessing product data. See [Tool security](/sdk/tools/security).

## Runtime compatibility

| Field | Value |
| --- | --- |
| Package format | ESM |
| TypeScript | Declarations included |
| Peer dependencies | None declared |
| Schema library | Zod 4 |
| Runtime boundary | Modern JavaScript runtimes; individual entry points may require runtime-specific capabilities |

Core's contracts are broadly portable, but not every entry point has the same environment needs. File/PDF loaders need file or binary access, MCP `stdio` needs a process-capable server runtime, and web-stream adapters need `ReadableStream`. Keep those APIs on the server unless the target runtime explicitly supports them.

## Continue learning

- [Install and setup](/sdk/install-and-setup)
- [Your first agent](/sdk/your-first-agent)
- [Agents](/sdk/agents)
- [Tools](/sdk/tools)
- [Streaming](/sdk/streaming)
- [Register agents in Studio](/studio/configure/register-agents-and-pipelines)
- [Inspect tools in Studio](/studio/tools)

For exact exports and signatures, use the [API reference](/packages/core/api-reference). For release history, read the [source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/core/CHANGELOG.md).
