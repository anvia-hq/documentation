# Anvia and Mastra

_Last reviewed: August 2026_

Mastra is an integrated TypeScript framework for agents and AI applications. It combines agents, tools, workflows, memory, retrieval, MCP, server/deployment support, development Studio, and observability. Anvia covers much of the same problem space, but splits it into an injected SDK runtime, focused adapter packages, a local Studio, and a separate self-hosted Lens product.

## What Mastra does especially well

Mastra’s official [agent overview](https://mastra.ai/docs/agents/overview) describes agents as open-ended model-and-tool loops that can retain memory, return structured responses, and participate in workflows or multi-agent systems. Registering an agent with the central `Mastra` instance makes shared storage, logging, observability, and the agent registry available to it.

Mastra draws a useful distinction between open-ended agents and predetermined workflows. Its [workflow system](https://mastra.ai/ai-workflows) supports schema-defined steps and sequential, parallel, branching, and looping control flow, with graph inspection in Mastra Studio.

The framework also has a broad application platform around the runtime. Official Mastra documentation covers typed tools and MCP, memory, retrieval, server adapters, deployment, scorers/evaluations, and [logs, metrics, and traces](https://mastra.ai/ai-agent-observability). This integrated path is attractive when a team wants one framework vocabulary across authoring, development, deployment, and operations.

## Where the overlap is real

Both Mastra and Anvia include:

- reusable agents with instructions, models, tools, and memory;
- direct generation and streaming;
- schema-validated structured output;
- typed tools and MCP connectivity;
- deterministic workflows or pipelines;
- retrieval and vector-store integrations;
- multi-agent composition and runtime context;
- local development inspection;
- tracing and evaluation integrations.

Neither project has exclusive ownership of these patterns. The decision is about how they are assembled and operated.

## The architectural difference

Mastra organizes capabilities around a framework instance and registration model. Agents and workflows gain access to shared framework services, and the same ecosystem includes a server, client SDK, Studio, deployment paths, and Mastra’s observability platform.

Anvia starts with smaller runtime shapes:

- a [completion](/sdk/completions) for one model call;
- an [agent](/sdk/agents) for a model-directed loop;
- an extractor for validated data;
- a [pipeline](/sdk/pipelines) for known stages and control flow.

Application code constructs provider models, memory stores, vector indexes, tools, observers, and services, then injects them. There is no required central application container. [Packages](/packages/) expose these adapters independently.

Anvia deliberately separates the two operational surfaces. [Studio](/studio/) is a trusted local console attached to live runtime objects. [Lens](/lens/) is a self-hosted production observability and evaluation workspace. This separation can suit teams that want the runtime deployment and telemetry deployment to have different security, scaling, and retention boundaries.

## Choose Anvia when

Anvia is a good fit when:

- dependency-injected runtime objects should fit inside an existing server architecture;
- provider models and storage adapters should be independently replaceable packages;
- the application needs first-party provider-neutral contracts for image, audio, transcription, OCR, embeddings, and model listing;
- local debugging and production observability should be separate deployments;
- self-hosting the Lens operational workspace is an explicit requirement;
- the team prefers pipeline and runtime lifecycle APIs without adopting an application framework container.

## Choose Mastra when

Mastra is a strong fit when:

- the team wants agents, workflows, storage, retrieval, server APIs, Studio, deployment, and platform tooling under one framework;
- registering components in a shared `Mastra` instance matches the application architecture;
- Mastra’s model router and AI SDK ecosystem already fit the model layer;
- Studio visualization and Mastra’s integrated observability/scorer path are central to the workflow;
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
- [Studio architecture](/studio/how-studio-works)
- [Lens core concepts](/lens/core-concepts)
