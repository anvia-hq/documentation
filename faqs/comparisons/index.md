# Choosing a TypeScript AI stack

_Last reviewed: August 2026_

There is no single best TypeScript AI stack. The useful question is which layer you want the library to own: a model call, a chat interface, an agent runtime, a workflow system, an autonomous workspace, or production observability.

Anvia is a provider-neutral runtime with separate first-party packages for models, persistence, retrieval, server streaming, React, local inspection through Studio, and self-hosted observability and evaluations through Lens. Other tools combine these boundaries differently, and that difference usually matters more than whether both projects list “agents” or “tools.”

## Start with the boundary

| If the center of the product is… | Start the evaluation with… | Why |
| --- | --- | --- |
| Streaming AI interfaces across several web frameworks | [Vercel AI SDK](/faqs/comparisons/vercel-ai-sdk) | AI SDK combines a broad provider architecture with dedicated UI libraries for React, Svelte, Vue, Angular, and community SolidJS support. |
| An integrated framework for agents, workflows, memory, retrieval, and deployment tooling | [Mastra](/faqs/comparisons/mastra) | Mastra registers these capabilities around a central framework instance and Studio. |
| Agents and workflows closely coupled to a built-in server and VoltOps experience | [VoltAgent](/faqs/comparisons/voltagent) | VoltAgent connects runtime registration, APIs, memory, workflow history, and observability. |
| Autonomous agents that work inside a filesystem and command environment | [Flue](/faqs/comparisons/flue) | Flue is harness-first and treats sessions, files, skills, commands, and sandboxes as central agent capabilities. |
| Immediate access to one vendor’s complete API | [Direct provider SDKs](/faqs/comparisons/direct-provider-sdks) | A vendor SDK exposes that provider’s native objects and new endpoints without an adapter boundary. |
| Provider-neutral agents and pipelines assembled through dependency injection | [Anvia SDK](/sdk/) | Anvia separates the runtime from providers, storage, UI, development inspection, and production operations. |

This table identifies a sensible first evaluation, not a winner. A product can legitimately use more than one option.

## Questions that expose the real trade-off

### What is the smallest abstraction you need?

For a single provider request, a direct SDK may be enough. For a streamed chat interface, an AI SDK Core and UI combination may fit better than adopting an entire agent runtime. Anvia becomes useful when the application needs reusable agents, typed tools, memory, retrieval, lifecycle policy, pipelines, normalized events, or provider changes behind shared contracts.

### Where should application state live?

Do not infer persistence from the word “agent.” Ask which component owns conversation messages, workflow checkpoints, artifacts, user identity, and business records. Anvia memory adapters own agent conversation persistence, while application authorization and business state remain application-owned. [Lens is operational telemetry, not application memory](/lens/).

### Is workflow execution model-driven or predetermined?

An agent loop lets a model decide which tools to call. A pipeline or workflow encodes known stages, branches, or parallel work. Most stacks offer both in some form, but their execution, suspension, replay, and persistence semantics differ. Compare those semantics against failure recovery requirements instead of comparing method names.

### Is the workspace part of the agent?

For repository work, document transformation, or coding tasks, filesystem and command execution may be the core abstraction. Flue makes that harness central. Anvia exposes [sandbox execution](/sdk/advanced/sandbox) as an optional tool capability, so ordinary product agents do not automatically receive a workspace or shell.

### How should development and production operations differ?

[Anvia Studio](/studio/) is a trusted local development console for registered agents and pipelines. [Lens](/lens/) is a separate self-hosted observability and evaluation workspace for production telemetry. Integrated platforms may put local inspection, deployment, and hosted observability under one product boundary. Decide whether that integration or separation matches the team’s operational model.

## Coexistence is often cleaner than replacement

Use explicit boundaries when combining stacks:

- Call a separately deployed agent through HTTP, a queue, or MCP.
- Keep one runtime authoritative for a conversation instead of letting two memory systems write the same thread.
- Translate message, tool, and stream event shapes at one adapter boundary.
- Keep provider credentials and authorization in the server component that executes the work.
- Send all runtimes to a common OpenTelemetry backend when cross-service tracing matters.

Avoid wrapping one agent loop inside another without a clear termination and error contract. If an existing stack is working, migrate one seam at a time: provider call, tool, agent endpoint, workflow, UI transport, or observability export.

## How these pages were researched

Alternative capabilities are linked to their official documentation or repositories and were checked in August 2026. Anvia descriptions are grounded in the current [SDK](/sdk/), [Studio](/studio/), [Lens](/lens/), and [Packages](/packages/) documentation. Product APIs change, so verify the linked source before making a long-lived architecture decision.
