# Anvia and Mastra

_Last reviewed: 24 November 2026, against Mastra `@mastra/core` 1.85.0 and Anvia SDK revision `7aa42c0a`._

Mastra is an integrated TypeScript framework for agents and AI applications. It combines agents, tools, workflows, memory, retrieval, MCP, server adapters, evaluations, observability, Studio, and the hosted Mastra platform. Anvia covers much of the same problem space, but splits it into an injected SDK runtime, focused adapter packages, a local Studio, and a separate self-hosted Lens product.

## At a glance

| Area | Mastra 1.x | Anvia |
| --- | --- | --- |
| Model layer | Model router with `"provider/model"` strings; AI SDK provider modules also accepted | [Provider packages](/sdk/providers/choose-a-provider) for OpenAI, Azure OpenAI, Anthropic, Gemini, Mistral, Grok, and Jev |
| Agent loop | Agents registered with a central `Mastra` instance | [`Agent`](/sdk/agents) objects injected by application code; no central container |
| Workflows | `createStep` with schemas; `.then`, `.parallel`, `.branch`, `.dowhile`, `.dountil`, `.foreach`, and more | Typed [pipelines](/sdk/pipelines) for stages, branches, and parallel work |
| Durability | Workflow suspend/resume and restart; durable agents (beta) with persisted run state | Experimental [`@anvia/durable`](/sdk/advanced/durable-execution) for agent runs, approvals, task graphs, and custom tasks; pipelines are not durable |
| Memory | Agent memory backed by the framework’s storage | [Memory contracts](/sdk/memory) with SQLite, Postgres, Drizzle, and Prisma adapters |
| Retrieval | RAG APIs | [Vector-store contracts](/sdk/knowledges/vector-stores) with eight adapters, plus [GraphRAG](/sdk/knowledges/graph-rag) on Neo4j or Memgraph |
| MCP | MCP connections | [`@anvia/mcp`](/sdk/advanced/mcp) |
| Multi-agent | Supervisor agents | [`agent.asTool()` and `AgentTeam`](/sdk/advanced/multi-agent) |
| Evaluations | Scorers and evals | [`@anvia/core/evals`](/sdk/evaluations), with results sent to Lens, Langfuse, or OpenTelemetry |
| Local dev UI | Mastra Studio, including a workflow graph | [Studio](/studio/) |
| Observability | Traces, logs, and metrics; storage, Mastra platform, Langfuse, Datadog, and OpenTelemetry exporters | OpenTelemetry, Langfuse, and self-hosted [Lens](/lens/) adapters |
| Hosting | Server adapters for common frameworks; the Mastra platform provides hosted Studio and Server products | Inside your own server; Lens is self-hosted |

## What Mastra does especially well

Mastra’s [agent overview](https://mastra.ai/docs/agents/overview) describes agents as model-and-tool loops that can retain memory, return structured responses, and participate in workflows or supervisor-led multi-agent systems. Registering an agent with the central `Mastra` instance makes shared storage, logging, observability, and the agent registry available to it.

Mastra draws a useful distinction between open-ended agents and predetermined workflows. Its [workflows](https://mastra.ai/docs/workflows/overview) use schema-defined steps and [control-flow methods](https://mastra.ai/docs/workflows/control-flow) for sequential, parallel, branching, and looping execution, with a graph view in Studio. Workflows can [suspend and resume](https://mastra.ai/docs/workflows/suspend-and-resume), restart from the last active step, and run on [workflow runners](https://mastra.ai/docs/deployment/workflow-runners) such as Inngest. [Durable agents](https://mastra.ai/docs/harness/durable-agents), in beta, run the agent loop inside a workflow so run state survives process restarts.

The framework also has a broad application platform around the runtime: [MCP](https://mastra.ai/docs/connections/mcp), [memory](https://mastra.ai/docs/memory/overview), [RAG](https://mastra.ai/reference/rag/overview), [server adapters](https://mastra.ai/docs/server/server-adapters), [deployment](https://mastra.ai/docs/deployment/overview), [evals](https://mastra.ai/docs/evals/overview), and [observability](https://mastra.ai/docs/observability/overview) with traces, logs, and metrics. The [model router](https://mastra.ai/models) reaches many providers through `"provider/model"` strings. The Mastra platform [replaces Mastra Cloud with separate Studio and Server products](https://mastra.ai/reference/migrations/mastra-cloud). This integrated path is attractive when a team wants one framework vocabulary across authoring, development, deployment, and operations.

## Where the overlap is real

Both Mastra and Anvia include:

- reusable agents with instructions, models, tools, and memory;
- direct generation and streaming;
- schema-validated structured output;
- typed tools and MCP connectivity;
- deterministic workflows or pipelines;
- persisted, resumable agent runs;
- retrieval and vector-store integrations;
- multi-agent composition and runtime context;
- local development inspection;
- evaluations and tracing integrations.

Neither project has exclusive ownership of these patterns. The decision is about how they are assembled and operated.

## The architectural difference

Mastra organizes capabilities around a framework instance and registration model. Agents and workflows gain access to shared framework services, and the same ecosystem includes server adapters, Studio, deployment paths, and the hosted Mastra platform.

Anvia starts with smaller runtime shapes:

- a [completion](/sdk/completions) for one model call;
- an [agent](/sdk/agents) for a model-directed loop;
- an extractor for validated data;
- a [pipeline](/sdk/pipelines) for known stages and control flow.

Application code constructs provider models, memory stores, vector indexes, tools, observers, and services, then injects them. There is no required central application container. [Packages](/packages/) expose these adapters independently.

Durability follows the same pattern. Mastra’s workflow suspend/resume and durable agents are part of the framework’s workflow engine and storage. Anvia’s experimental [`@anvia/durable`](/sdk/advanced/durable-execution) runtime wraps existing `Agent` definitions, records submissions, model responses, tool results, and approvals in SQLite, Postgres, Drizzle, or Prisma, and also runs [static task graphs](/sdk/advanced/durable-execution/graphs). It does not make Anvia pipelines durable; production pipelines still run behind an application-owned job system.

Anvia deliberately separates the two operational surfaces. [Studio](/studio/) is a trusted local console attached to live runtime objects. [Lens](/lens/) is a self-hosted production observability and evaluation workspace. This separation can suit teams that want the runtime deployment and telemetry deployment to have different security, scaling, and retention boundaries.

## Choose Anvia when

Anvia is a good fit when:

- dependency-injected runtime objects should fit inside an existing server architecture;
- provider models and storage adapters should be independently replaceable packages;
- the application needs first-party provider-neutral contracts for image generation, speech generation, transcription, embeddings, and model listing, with provider-specific models such as Mistral OCR alongside them;
- local debugging and production observability should be separate deployments;
- self-hosting the Lens operational workspace is an explicit requirement;
- the team prefers pipeline and runtime lifecycle APIs without adopting an application framework container.

## Choose Mastra when

Mastra is a strong fit when:

- the team wants agents, workflows, storage, retrieval, server APIs, Studio, deployment, and platform tooling under one framework;
- registering components in a shared `Mastra` instance matches the application architecture;
- Mastra’s model router, or its AI SDK provider support, already fits the model layer;
- workflow suspend/resume, restart, and workflow runners such as Inngest are central to the workload;
- Studio visualization, the hosted Mastra platform, and Mastra’s integrated observability and evals path are central to the workflow;
- the team prefers framework conventions and scaffolding over assembling focused packages.

## Can they coexist?

Yes, but running one framework’s agent loop inside the other should be an explicit service boundary rather than an object cast.

Useful coexistence patterns include:

- expose a Mastra or Anvia agent over HTTP and call it from the other runtime as a bounded tool;
- expose capabilities through MCP when discovery is useful;
- use one stack for synchronous product agents and the other for an isolated workflow service;
- export telemetry from both services to a shared OpenTelemetry backend.

For migration, choose one authoritative owner for each conversation and workflow run. Move the model/tool loop first, then map memory records, approval states, and stream events deliberately. Mastra and Anvia have different message, tool, storage, and execution types, so a compile-time adapter is safer than sharing database tables directly.

## Related Anvia pages

- [Runtime lifecycle](/sdk/agents/runtime-lifecycle)
- [Memory](/sdk/memory)
- [Pipelines](/sdk/pipelines)
- [Durable execution](/sdk/advanced/durable-execution)
- [Evaluations](/sdk/evaluations)
- [Studio architecture](/studio/how-studio-works)
- [Lens core concepts](/lens/core-concepts)

## Sources (reviewed 2026-11-24)

- Mastra: [Agents overview](https://mastra.ai/docs/agents/overview), [Workflows overview](https://mastra.ai/docs/workflows/overview), [Control flow](https://mastra.ai/docs/workflows/control-flow), [Suspend and resume](https://mastra.ai/docs/workflows/suspend-and-resume), [Workflow runners](https://mastra.ai/docs/deployment/workflow-runners), [Durable agents](https://mastra.ai/docs/harness/durable-agents), [MCP](https://mastra.ai/docs/connections/mcp), [Memory](https://mastra.ai/docs/memory/overview), [RAG reference](https://mastra.ai/reference/rag/overview), [Server adapters](https://mastra.ai/docs/server/server-adapters), [Deployment](https://mastra.ai/docs/deployment/overview), [Evals](https://mastra.ai/docs/evals/overview), [Observability](https://mastra.ai/docs/observability/overview), [Models](https://mastra.ai/models), [Mastra Cloud migration](https://mastra.ai/reference/migrations/mastra-cloud), [`@mastra/core` on npm](https://www.npmjs.com/package/@mastra/core).
- Anvia: SDK source at revision `7aa42c0a` (`@anvia/core` 1.22.0, `@anvia/durable` 0.18.0) and the linked Anvia documentation.
