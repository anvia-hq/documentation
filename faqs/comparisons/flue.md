# Anvia and Flue

_Last reviewed: August 2026_

Flue is a TypeScript framework for autonomous agents and the workflows around them. Its defining idea is a harness: a model works inside an environment containing sessions, tools, instructions, skills, files, commands, and a sandbox. Anvia supports agents, skills, tools, MCP, pipelines, and optional sandbox execution, but its ordinary runtime is application-service-first rather than workspace-first.

## What Flue does especially well

Flue’s official [“Why Flue?” guide](https://flueframework.com/docs/introduction/why-flue/) describes a harness-first architecture intended for agents that act inside an environment instead of only returning a response. Agent modules are discovered from the project, and the [agent guide](https://flueframework.com/docs/guide/building-agents/) combines a continuing conversation with tools, actions, skills, filesystem context, and route-level exposure.

[Sandboxes](https://flueframework.com/docs/guide/sandboxes/) are a first-class design boundary. Flue includes an in-memory virtual workspace, supports trusted local host access on Node.js, and documents adapters for remote sandbox providers. The documentation is careful about the security distinction: its virtual sandbox is not a network-isolation boundary, and `local()` is direct host access rather than isolation.

Flue’s [workflows](https://flueframework.com/docs/guide/workflows/) are finite, inspectable operations with validated inputs and outputs, whereas agents continue across messages. Its [Node target documentation](https://flueframework.com/docs/guide/targets/node/) describes persisted canonical agent conversations and replacement-process recovery, while also explaining that an interrupted Node workflow does not receive the same recovery path.

The CLI discovers modules and builds target-specific Node.js or Cloudflare output. Flue also provides its own SDK and [React bindings](https://flueframework.com/docs/guide/react/) for durable agent and workflow event streams.

## Where the overlap is real

Both stacks support:

- TypeScript agents and multi-agent delegation;
- typed tools and MCP connections;
- reusable skills and instructions;
- streaming events and cancellation;
- conversation persistence;
- finite workflows or pipelines;
- filesystem and command execution through sandbox integrations;
- observability export;
- React integration.

Flue does not uniquely provide autonomous agents, and Anvia does not uniquely provide typed tools or workflows. Their default mental models differ.

## The architectural difference

Flue starts from a discovered application module and a harness. A continuing agent has an identity, canonical conversation, and execution environment. Filesystem and shell capabilities are ordinary parts of the design, and the generated target owns route and event-stream infrastructure.

Anvia starts from runtime objects created by application code. A model can be used for a one-shot completion, extractor, agent, or pipeline without receiving a filesystem. Tools are bounded application functions by default. [Sandbox execution](/sdk/advanced/sandbox) is added when a workflow genuinely needs files or commands, and the application owns sandbox identity and lifecycle.

Anvia’s [pipelines](/sdk/pipelines) express typed stages, branches, parallel work, and agent steps. They are runtime orchestration rather than a durability system: production deployments normally place pipeline execution behind an application-owned queue such as BullMQ or Trigger.dev. Flue’s agent durability and target generation make a different set of ownership choices, while its docs similarly distinguish durable conversations from non-checkpointed workflow functions.

Anvia also separates local and production inspection. [Studio](/studio/) attaches to live local objects; [Lens](/lens/) is a self-hosted observability and evaluation workspace. Flue’s runtime, CLI, target, SDK, and observability hooks are designed as parts of the same harness framework.

## Choose Anvia when

Anvia is a good fit when:

- most agents operate on application APIs and data rather than a persistent workspace;
- tools should be narrow, explicitly authorized functions unless sandbox access is added;
- agents and pipelines need to fit inside an existing server and worker architecture;
- provider-specific completion, embedding, media, OCR, and model-listing adapters should share normalized contracts;
- a local Studio and separate self-hosted Lens deployment match the security model;
- the team wants storage, transport, UI, and observability as independently selectable packages.

## Choose Flue when

Flue is a strong fit when:

- the agent’s primary job is to inspect files, run commands, and produce artifacts;
- a coding-agent-like harness is the intended abstraction;
- file-based discovery, generated HTTP routes, CLI workflows, and Node/Cloudflare targets are desirable;
- continuing agent identity and documented recovery semantics are core requirements;
- Flue’s virtual, local, or remote sandbox model matches the execution environment;
- the team wants the project shaped for collaboration with a coding agent.

## Can they coexist?

Yes. A strong boundary is to treat a Flue agent as an autonomous worker behind an Anvia tool or pipeline stage:

1. Anvia receives and authorizes the product request.
2. A bounded tool or worker submits a task to the Flue agent or workflow.
3. Flue owns the workspace, command execution, and artifacts.
4. Anvia receives a typed result and continues the product flow.

The reverse is also possible: a Flue tool can call an Anvia agent service. Keep one runtime authoritative for each conversation and one system responsible for sandbox cleanup. Map cancellation, retries, and unknown tool outcomes explicitly, because autonomous workspace actions may have side effects that cannot safely be repeated.

For migration, preserve the route or job contract first. Move instructions and bounded tools before moving durable conversation history or sandbox state; those are the parts where the two architectures differ most.

## Related Anvia pages

- [Skills](/sdk/advanced/skills)
- [Dynamic tools](/sdk/advanced/dynamic-tools)
- [Sandbox execution](/sdk/advanced/sandbox)
- [Pipelines](/sdk/pipelines)
- [Studio sandboxes](/studio/sandboxes)
