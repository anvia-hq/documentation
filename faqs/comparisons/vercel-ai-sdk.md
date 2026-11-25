# Anvia and Vercel AI SDK

_Last reviewed: 24 November 2026, against AI SDK 7 (`ai` 7.0.181, `@ai-sdk/workflow` 2.0.113) and Anvia SDK revision `7aa42c0a`._

Vercel AI SDK is a provider-agnostic TypeScript toolkit for AI applications and agents. Its strongest distinguishing surface is the combination of a unified model layer with polished streaming UI integrations across several web frameworks. Anvia overlaps in provider abstraction, completions, tools, agents, MCP, streaming, durable agent runs, and React state, but draws a different runtime boundary around memory adapters, pipelines, lifecycle callbacks, evaluations, Studio, and Lens.

## At a glance

| Area | AI SDK 7 | Anvia |
| --- | --- | --- |
| Model layer | Standard provider specification with official, community, and OpenAI-compatible providers; model middleware | [Provider packages](/sdk/providers/choose-a-provider) for OpenAI, Azure OpenAI, Anthropic, Gemini, Mistral, Grok, and Jev |
| Agent loop | `Agent` interface and `ToolLoopAgent` | [`Agent`](/sdk/agents) with a normalized run lifecycle |
| Workflows and durability | `WorkflowAgent` (`@ai-sdk/workflow`) runs the tool loop on Workflow DevKit, survives restarts, retries tool steps, and persists approvals | Typed [pipelines](/sdk/pipelines); experimental [`@anvia/durable`](/sdk/advanced/durable-execution) for agent runs, approvals, task graphs, and custom tasks |
| Memory | Provider memory tools, external memory providers, or custom tools; no built-in store | [Memory contracts](/sdk/memory) with SQLite, Postgres, Drizzle, and Prisma adapters |
| Retrieval | Embedding APIs in Core | [Vector-store contracts](/sdk/knowledges/vector-stores) with eight adapters, plus [GraphRAG](/sdk/knowledges/graph-rag) on Neo4j or Memgraph |
| MCP | `createMCPClient` in `@ai-sdk/mcp` | [`@anvia/mcp`](/sdk/advanced/mcp) |
| Multi-agent | Not reviewed | [`agent.asTool()` and `AgentTeam`](/sdk/advanced/multi-agent) |
| Evaluations | No first-party evaluation API in the reviewed sources | [`@anvia/core/evals`](/sdk/evaluations) suites, judges, trials, and baselines |
| Observability | OpenTelemetry through `@ai-sdk/otel` | OpenTelemetry, Langfuse, and self-hosted [Lens](/lens/) adapters |
| Local dev UI | Not reviewed | [Studio](/studio/) |
| Frontend | AI SDK UI for React, Vue, Svelte, and Angular; community SolidJS | Framework-neutral [`@anvia/client`](/packages/client), [`@anvia/react`](/packages/react) with its [headless primitives](/packages/react/capabilities) |
| Runtimes | Not reviewed | Node.js; Bun 1.3.14 tested for Core, Client, Server, the OpenAI, Anthropic, Gemini, and Mistral providers, MCP, SQLite memory, and sandbox |

## What AI SDK does especially well

AI SDK defines a [standard provider and model architecture](https://ai-sdk.dev/docs/foundations/providers-and-models) with official and community provider packages plus an OpenAI-compatible provider for self-hosted models. Its Core APIs cover generation, streaming, structured output, embeddings, [model middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware), and [function, provider-defined, provider-executed, and dynamic tools](https://ai-sdk.dev/docs/foundations/tools).

For agent loops, AI SDK publishes an [`Agent` interface and `ToolLoopAgent`](https://ai-sdk.dev/docs/reference/ai-sdk-core/agent) that generate or stream and can perform multi-step tool use. The agent interface works with AI SDK’s agent UI stream helpers, so custom implementations can use the same UI transport. [`WorkflowAgent`](https://ai-sdk.dev/docs/agents/workflow-agent) runs the same kind of tool loop inside Workflow DevKit: runs survive restarts, tool steps are retried, and pending approvals persist across processes.

The [AI SDK UI reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui) is a major reason to choose it. It provides chat, completion, object, and UI-message stream utilities for React, Vue, Svelte, and Angular, with community SolidJS support. This is broader first-party frontend-framework coverage than Anvia’s React packages.

AI SDK also documents [MCP clients](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools), [memory patterns](https://ai-sdk.dev/docs/agents/memory) based on provider tools, external memory providers, or custom tools, and [OpenTelemetry telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry) through `@ai-sdk/otel`.

## Where the overlap is real

Both stacks support:

- provider-neutral model calls;
- streaming text and structured events;
- schema-validated tools and multi-step tool loops;
- structured output;
- MCP tools;
- durable agent runs with persisted approvals;
- model and UI message representations;
- React chat state;
- OpenTelemetry export;
- custom providers or adapters.

These are shared capabilities, not reasons by themselves to prefer one stack.

## The architectural difference

AI SDK’s center is the model-to-application and model-to-UI path. Its primitives are easy to use directly inside application routes, and its UI protocol connects server generation to several web frameworks. Memory is a pattern built from tools or external providers rather than a storage contract.

Anvia’s center is a reusable runtime object. An application constructs provider models, tools, stores, indexes, observers, and services, then injects them into completions, agents, extractors, or [typed pipelines](/sdk/pipelines). Agent runs expose a normalized lifecycle across turns, tools, memory, approvals, and nested work.

Anvia also separates surrounding products:

- [`@anvia/server`](/packages/server) and [`@anvia/client`](/packages/client) handle the streaming protocol; [`@anvia/react`](/packages/react) handles React state and the [headless chat primitives](/packages/react/capabilities).
- [`@anvia/durable`](/sdk/advanced/durable-execution) adds experimental durable runs without changing the agent definition.
- [Studio](/studio/) inspects registered runtime objects locally.
- [Lens](/lens/) receives production telemetry and stores evaluation results; [`@anvia/core/evals`](/sdk/evaluations) runs suites in code.
- [Package adapters](/packages/catalog) cover memory stores, vector stores, graph stores, providers, and observability backends.

## Choose Anvia when

Anvia is a good fit when the application needs one or more of the following:

- agents and deterministic pipelines sharing tools, models, lifecycle policy, and events;
- first-party conversation memory contracts and storage adapters;
- provider-neutral media, embedding, retrieval, GraphRAG, and model-listing contracts;
- in-code evaluation suites, local runtime inspection in Studio, and a separate self-hosted Lens deployment;
- dependency injection instead of a framework-owned application container;
- one normalized agent stream that includes turns, tools, usage, approvals, and errors.

## Choose AI SDK when

AI SDK is a strong fit when:

- the primary job is building a streaming AI interface quickly;
- the frontend uses Vue, Svelte, Angular, or another supported UI integration;
- the team wants AI SDK’s provider ecosystem and model middleware;
- generation functions, `ToolLoopAgent`, and `WorkflowAgent` are sufficient runtime abstractions;
- close alignment with Next.js and Vercel’s AI application patterns is valuable.

Anvia’s framework-neutral `@anvia/client` can be used outside React, but Anvia has no first-party Vue, Svelte, or Angular bindings.

## Can they coexist?

Yes. The cleanest coexistence boundary is usually HTTP:

- Anvia can own an agent service while an existing AI SDK application calls that service through a custom transport.
- AI SDK can own a UI route while separate Anvia pipelines handle background or operational work.
- Both services can export OpenTelemetry to the same backend.

Their model, message, tool, and stream types are not interchangeable. Translate them in one adapter rather than casting between packages. If migrating, start with a leaf route or one agent, keep its existing UI protocol stable, and only then replace the server runtime behind that boundary.

## Related Anvia pages

- [Completions](/sdk/completions)
- [Agents](/sdk/agents)
- [Streaming](/sdk/streaming)
- [Durable execution](/sdk/advanced/durable-execution)
- [Client package](/packages/client)
- [React package](/packages/react)
- [Server package](/packages/server)

## Sources (reviewed 2026-11-24)

- AI SDK: [Providers and models](https://ai-sdk.dev/docs/foundations/providers-and-models), [Tools](https://ai-sdk.dev/docs/foundations/tools), [Middleware](https://ai-sdk.dev/docs/ai-sdk-core/middleware), [Agent reference](https://ai-sdk.dev/docs/reference/ai-sdk-core/agent), [WorkflowAgent](https://ai-sdk.dev/docs/agents/workflow-agent), [Memory](https://ai-sdk.dev/docs/agents/memory), [MCP tools](https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools), [Telemetry](https://ai-sdk.dev/docs/ai-sdk-core/telemetry), [AI SDK UI reference](https://ai-sdk.dev/docs/reference/ai-sdk-ui), [AI SDK 7 announcement](https://vercel.com/blog/ai-sdk-7), [`ai` on npm](https://www.npmjs.com/package/ai).
- Anvia: SDK source at revision `7aa42c0a` (`@anvia/core` 1.22.0, `@anvia/durable` 0.18.0, `@anvia/client` 1.9.0) and the linked Anvia documentation.
