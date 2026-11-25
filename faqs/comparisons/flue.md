# Anvia and Flue

_Last reviewed: 24 November 2026, against Flue 2.3.1 (`@flue/runtime`) and Anvia SDK revision `7aa42c0a`._

Flue is a TypeScript framework for autonomous agents built around a harness: a model that works with tools, skills, subagents, and, when you add one, a sandboxed filesystem and shell. Flue 2 rebuilt the framework around agent hooks and a Vite plugin, and removed its earlier workflow and action APIs. Anvia supports agents, skills, tools, MCP, pipelines, and optional sandbox execution, but its ordinary runtime is application-service-first rather than harness-first.

## At a glance

| Area | Flue 2.x | Anvia |
| --- | --- | --- |
| Agent loop | Agent functions in modules marked `'use agent'`, configured with hooks such as `useModel`, `useTool`, and `useSkill` | [`Agent`](/sdk/agents) objects constructed and injected by application code |
| Workflows | No workflow API; a workflow is “any script or program that runs an agent”, with durable steps delegated to engines such as Cloudflare Workflows or Inngest | Typed [pipelines](/sdk/pipelines) for known stages, branches, and parallel work |
| Durability | Durable conversations and submissions with a durable `db.ts` adapter; the Node.js default is in-memory SQLite | Experimental [`@anvia/durable`](/sdk/advanced/durable-execution) for agent runs, approvals, task graphs, and custom tasks; pipelines are not durable |
| Memory | Each agent instance is persisted by ID; `usePersistentState` for agent state | [Memory contracts](/sdk/memory) with SQLite, Postgres, Drizzle, and Prisma adapters |
| Workspace | Opt-in through `useSandbox()`: virtual in-memory bash, `local()` host access on Node.js, or remote adapters | Opt-in [`@anvia/sandbox`](/sdk/advanced/sandbox) tools (Docker-backed) |
| MCP | `useMcpConnection` | [`@anvia/mcp`](/sdk/advanced/mcp) |
| Multi-agent | `useSubagent` | [`agent.asTool()` and `AgentTeam`](/sdk/advanced/multi-agent) |
| Observability | `@flue/opentelemetry` and a Sentry integration | OpenTelemetry, Langfuse, and [Lens](/lens/) adapters |
| Frontend | Flue Agent SDK and `@flue/react` | Framework-neutral [`@anvia/client`](/packages/client), [`@anvia/react`](/packages/react) with its [headless primitives](/packages/react/capabilities) |
| Runtimes and hosting | Vite builds for Node.js or Cloudflare targets | Inside your own server; Node.js, with Bun 1.3.14 tested for Core, Client, Server, the OpenAI, Anthropic, Gemini, and Mistral providers, MCP, SQLite memory, and sandbox |

## What Flue does especially well

Flue’s [“Why Flue?” guide](https://flueframework.com/docs/guide/why-flue/) describes the agent harness as the core of the framework, not a feature. In the [agent guide](https://flueframework.com/docs/guide/building-agents/), an agent is a function that returns its instructions, marked with a `'use agent'` module directive and discovered at build time. Hooks such as `useModel`, `useTool`, `useSkill`, `useSandbox`, `useMcpConnection`, `useSubagent`, and `usePersistentState` attach capabilities, and each agent instance is persisted by ID so a conversation can continue over time. Agents are served through `createAgentRouter`, which application code mounts explicitly.

[Sandboxes](https://flueframework.com/docs/guide/sandboxes/) are opt-in: an agent without `useSandbox()` has no filesystem or shell. The virtual sandbox emulates bash in memory, is isolated from the host, and allows network access only through an explicit allowlist. `local()` binds the agent to the host filesystem and shell on Node.js and provides no isolation. Remote adapters cover providers such as Daytona, E2B, Modal, and Cloudflare Sandbox.

Flue’s [durability guide](https://flueframework.com/docs/guide/durability/) defines a clear contract: each accepted submission reaches exactly one terminal outcome, with recovery from recorded evidence. Cross-restart recovery requires a durable adapter in `db.ts`. On the [Node.js target](https://flueframework.com/docs/guide/node-target/), a replacement process recovers conversations and interrupted submissions; on Cloudflare, each conversation is a Durable Object. Flue states that it “does not checkpoint arbitrary TypeScript execution”, so scripts around agents use an external workflow engine for step durability.

Flue applications are Vite projects built through `@flue/vite` for Node.js or Cloudflare ([deploy guide](https://flueframework.com/docs/guide/deploy/)), with [React bindings](https://flueframework.com/docs/guide/react/) that turn durable conversation streams into React state and [OpenTelemetry instrumentation](https://flueframework.com/docs/guide/observability/).

## Where the overlap is real

Both stacks support:

- TypeScript agents and multi-agent delegation;
- typed tools and MCP connections;
- reusable skills and instructions;
- streaming events and cancellation;
- conversation persistence and durable agent runs;
- filesystem and command execution through opt-in sandboxes;
- OpenTelemetry export;
- React integration.

Flue does not uniquely provide autonomous agents, and Anvia does not uniquely provide typed tools. Their default mental models differ.

## The architectural difference

Flue starts from a discovered agent module and a harness. An agent has a durable identity, a canonical conversation, and hooks that declare its capabilities. The Flue runtime owns conversation routes, submission queues, and recovery.

Anvia starts from runtime objects created by application code. A model can be used for a one-shot completion, extractor, agent, or pipeline without receiving a filesystem. Tools are bounded application functions by default. [Sandbox execution](/sdk/advanced/sandbox) is added when work genuinely needs files or commands, and the application owns sandbox identity and lifecycle.

For durability, Anvia keeps the choice explicit. An ordinary `Agent` run is in-process. The experimental [`@anvia/durable`](/sdk/advanced/durable-execution) runtime records submissions, model responses, tool results, and approvals in SQLite, Postgres, Drizzle, or Prisma, and resumes unfinished runs after a restart. It also runs [static task graphs](/sdk/advanced/durable-execution/graphs). Anvia [pipelines](/sdk/pipelines) are runtime orchestration rather than a durability system; durable pipeline execution is not part of `@anvia/durable`, so production pipelines still run behind an application-owned job system. Both projects therefore leave script-level orchestration outside the agent runtime.

Anvia also separates local and production inspection. [Studio](/studio/) attaches to live local objects; [Lens](/lens/) is a self-hosted observability and evaluation workspace, and [`@anvia/core/evals`](/sdk/evaluations) runs evaluation suites in code.

## Choose Anvia when

Anvia is a good fit when:

- most agents operate on application APIs and data rather than a persistent workspace;
- tools should be narrow, explicitly authorized functions unless sandbox access is added;
- agents and pipelines need to fit inside an existing server and worker architecture;
- provider adapters should share normalized completion, embedding, image, speech, transcription, and model-listing contracts, with provider-specific models such as Mistral OCR alongside them;
- in-code evaluation suites, a local Studio, and a separate self-hosted Lens deployment match the security model;
- the team wants storage, retrieval (including [GraphRAG](/sdk/knowledges/graph-rag)), transport, UI, and observability as independently selectable packages.

## Choose Flue when

Flue is a strong fit when:

- the agent’s primary job is to inspect files, run commands, and produce artifacts;
- a coding-agent-like harness with hook-based capabilities is the intended abstraction;
- build-time agent discovery, Vite tooling, and Node.js or Cloudflare targets are desirable;
- durable conversation identity and Flue’s documented submission recovery are core requirements;
- Flue’s virtual, local, or remote sandbox model matches the execution environment.

## Can they coexist?

Yes. A strong boundary is to treat a Flue agent as an autonomous worker behind an Anvia tool or pipeline stage:

1. Anvia receives and authorizes the product request.
2. A bounded tool or worker sends a task to a Flue agent conversation.
3. Flue owns the workspace, command execution, and artifacts.
4. Anvia receives a typed result and continues the product flow.

The reverse is also possible: a Flue tool can call an Anvia agent service. Keep one runtime authoritative for each conversation and one system responsible for sandbox cleanup. Map cancellation, retries, and unknown tool outcomes explicitly, because autonomous workspace actions may have side effects that cannot safely be repeated.

For migration, preserve the route or job contract first. Move instructions and bounded tools before moving durable conversation history or sandbox state; those are the parts where the two architectures differ most.

## Related Anvia pages

- [Skills](/sdk/advanced/skills)
- [Dynamic tools](/sdk/advanced/dynamic-tools)
- [Sandbox execution](/sdk/advanced/sandbox)
- [Durable execution](/sdk/advanced/durable-execution)
- [Pipelines](/sdk/pipelines)
- [Studio sandboxes](/studio/sandboxes)

## Sources (reviewed 2026-11-24)

- Flue: [Why Flue?](https://flueframework.com/docs/guide/why-flue/), [Building agents](https://flueframework.com/docs/guide/building-agents/), [Sandboxes](https://flueframework.com/docs/guide/sandboxes/), [Workflows](https://flueframework.com/docs/guide/workflows/), [Durability](https://flueframework.com/docs/guide/durability/), [Node.js target](https://flueframework.com/docs/guide/node-target/), [Deploy](https://flueframework.com/docs/guide/deploy/), [React](https://flueframework.com/docs/guide/react/), [MCP](https://flueframework.com/docs/guide/mcp/), [Observability](https://flueframework.com/docs/guide/observability/), [Flue 2 migration guide](https://flueframework.com/docs/guide/migration/), [`@flue/runtime` on npm](https://www.npmjs.com/package/@flue/runtime).
- Anvia: SDK source at revision `7aa42c0a` (`@anvia/core` 1.22.0, `@anvia/durable` 0.18.0, `@anvia/mcp` 1.2.8) and the linked Anvia documentation.
