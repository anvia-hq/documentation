# Anvia and VoltAgent

_Last reviewed: 24 November 2026, against VoltAgent `@voltagent/core` 2.11.1 and Anvia SDK revision `7aa42c0a`._

VoltAgent is an open-source TypeScript framework for agents and workflows with memory, a built-in server, and an observability experience through VoltOps. Anvia overlaps across agents, tools, memory, workflows, streaming, evaluations, and tracing, but uses a package-and-dependency-injection architecture and separates local Studio from the self-hosted Lens operational workspace.

## At a glance

| Area | VoltAgent 2.x | Anvia |
| --- | --- | --- |
| Model layer | Uses AI SDK providers directly | [Provider packages](/sdk/providers/choose-a-provider) for OpenAI, Azure OpenAI, Anthropic, Gemini, Mistral, Grok, and Jev |
| Agent loop | `Agent` with instructions, tools, memory, hooks, retrievers, and voice, registered with a central `VoltAgent` | [`Agent`](/sdk/agents) objects injected by application code |
| Workflows | `createWorkflowChain` with asynchronous starts, suspend/resume, and cancellation | Typed [pipelines](/sdk/pipelines) for stages, branches, and parallel work |
| Durability | `restart()` and `restartAllActive()` for interrupted workflow runs; persisted history needs a LibSQL, Postgres, or Supabase adapter (default is in-memory) | Experimental [`@anvia/durable`](/sdk/advanced/durable-execution) for agent runs, approvals, task graphs, and custom tasks; pipelines are not durable |
| Memory | Memory adapters for LibSQL, Postgres, and Supabase | [Memory contracts](/sdk/memory) with SQLite, Postgres, Drizzle, and Prisma adapters |
| Retrieval | Retriever agents for RAG | [Vector-store contracts](/sdk/knowledges/vector-stores) with eight adapters, plus [GraphRAG](/sdk/knowledges/graph-rag) on Neo4j or Memgraph |
| MCP | Model Context Protocol server connections | [`@anvia/mcp`](/sdk/advanced/mcp) |
| Multi-agent | Supervisor runtime with specialized sub-agents | [`agent.asTool()` and `AgentTeam`](/sdk/advanced/multi-agent) |
| Evaluations | Agent eval suites | [`@anvia/core/evals`](/sdk/evaluations), with results sent to Lens, Langfuse, or OpenTelemetry |
| Local dev UI | VoltOps developer console connected to the local process | [Studio](/studio/) |
| Observability | VoltOps LLM observability | OpenTelemetry, Langfuse, and self-hosted [Lens](/lens/) adapters |
| Hosting | Built-in Hono server; VoltOps deployment with GitHub integration and managed infrastructure | Inside your own server; Lens is self-hosted |

## What VoltAgent does especially well

VoltAgent’s [framework overview](https://voltagent.dev/docs/overview/) presents a cohesive agent platform: Zod-typed tools, memory adapters, supervisor-led multi-agent teams, workflows, MCP, retriever agents, eval suites, a built-in server, and VoltOps observability. Its [`Agent` abstraction](https://voltagent.dev/docs/agents/overview/) wraps a language model with instructions, tools, memory, hooks, retrieval, voice, and other configured capabilities.

Its [workflow system](https://voltagent.dev/docs/workflows/overview/) combines typed chain construction with asynchronous starts, execution state, suspend/resume, cancellation, and `restart()` / `restartAllActive()` recovery for runs left in progress. Workflow memory stores execution history and is documented as separate from an agent’s conversational memory, which is an important operational distinction. The default storage is in-memory; persistence uses LibSQL, Postgres, or Supabase adapters.

VoltAgent’s observability story is closely connected to the runtime. The [observability overview](https://voltagent.dev/docs/observability/overview/) names VoltOps as the primary observability tool, and the [VoltOps developer console](https://voltagent.dev/docs/observability/developer-console/) connects directly to the local process for debugging.

## Where the overlap is real

Both stacks support:

- TypeScript agents with tools and multi-step execution;
- conversation memory and pluggable persistence;
- deterministic workflows with agents as steps;
- recovery of interrupted work after a restart;
- streaming model and agent output;
- multi-agent composition;
- MCP and retrieval integrations;
- evaluation suites;
- lifecycle hooks and runtime events;
- local inspection and production telemetry.

These shared features should be compared by semantics—especially memory scope, recovery, authorization, and trace retention—not by counting names in a navigation menu.

## The architectural difference

VoltAgent’s central `VoltAgent` registration connects agents, workflows, the server, memory defaults, and observability. Its documented [HTTP API](https://voltagent.dev/docs/api/overview/) exposes registered agents, workflows, tools, memory, logs, and traces, with SSE and WebSocket streaming. This gives the framework a broad application-server boundary.

Anvia keeps these pieces separable:

- [`@anvia/core`](/packages/core) owns provider-neutral runtime contracts.
- Provider, memory, vector, graph, and observability adapters are independent packages.
- [`@anvia/server`](/packages/server) creates JSONL and SSE responses, Anvia client-protocol streams, and resumable streams without becoming the application server.
- [Studio](/studio/) discovers runtime objects for local development.
- [Lens](/lens/) is a separate self-hosted observability and evaluation system.

Recovery semantics differ. VoltAgent restarts workflow executions recorded in its workflow memory. Anvia pipelines are typed runtime graphs, not a durable job queue, so production pipeline workers stay with the application and its queue or workflow service. For agent work, the experimental [`@anvia/durable`](/sdk/advanced/durable-execution) runtime records model responses, tool results, and approvals in SQLite, Postgres, Drizzle, or Prisma and resumes unfinished runs and [task graphs](/sdk/advanced/durable-execution/graphs) after a restart. Teams needing these semantics should compare the exact storage and recovery guarantees to their workload.

## Choose Anvia when

Anvia is a good fit when:

- the application already has an HTTP framework, worker system, and dependency-injection boundary;
- provider-neutral model and media contracts should be first-party runtime dependencies;
- agent memory, durable execution, server transport, React state, and observability should remain independently selectable;
- production telemetry and evaluation results should land in a self-hosted Lens deployment;
- local Studio must operate as a trusted developer console rather than an application API platform;
- package-level APIs and compatibility need to be reviewed independently.

## Choose VoltAgent when

VoltAgent is a strong fit when:

- the team wants a central framework that registers agents and workflows and exposes them through a built-in server boundary;
- VoltOps is the preferred inspection and observability workflow;
- workflow history, asynchronous execution, suspension, and restart APIs match the workload;
- the project already uses VoltAgent’s memory adapters, retrievers, or AI SDK model layer;
- one integrated framework experience is preferable to separate runtime, Studio, and observability products.

## Can they coexist?

Yes. Keep the boundary explicit:

- call a VoltAgent endpoint from an Anvia tool, or an Anvia endpoint from a VoltAgent tool;
- use one framework for user-facing agents and the other for a separately deployed workflow service;
- export both services to the same OpenTelemetry collector;
- keep their memory and workflow storage schemas separate.

During migration, preserve the external HTTP or queue contract first. Then translate tools and messages, replay representative traces, and move memory only after defining user/conversation scope in the destination runtime. Do not let both memory systems append to the same conversation during a gradual cutover.

## Related Anvia pages

- [Agents](/sdk/agents)
- [Memory stores](/sdk/memory/store-adapters)
- [Pipeline workers](/sdk/pipelines/production-workers)
- [Durable execution](/sdk/advanced/durable-execution)
- [Studio runtime status](/studio/runtime-status)
- [Lens observability](/lens/observability)

## Sources (reviewed 2026-11-24)

- VoltAgent: [Overview](https://voltagent.dev/docs/overview/), [Agents](https://voltagent.dev/docs/agents/overview/), [Workflows](https://voltagent.dev/docs/workflows/overview/), [Observability overview](https://voltagent.dev/docs/observability/overview/), [VoltOps developer console](https://voltagent.dev/docs/observability/developer-console/), [HTTP API](https://voltagent.dev/docs/api/overview/), [`@voltagent/core` on npm](https://www.npmjs.com/package/@voltagent/core).
- Anvia: SDK source at revision `7aa42c0a` (`@anvia/core` 1.22.0, `@anvia/durable` 0.18.0, `@anvia/server` 1.5.0) and the linked Anvia documentation.
