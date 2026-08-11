# Capabilities

Studio discovers its surfaces from registered targets and configured stores.

| Surface | Package behavior |
| --- | --- |
| Playground | Runs real agents, streams JSONL events, stores transcripts, supports cancel, approvals, questions, attachments, and model selection |
| Agents | Reports identity, model, tools, context, memory, middleware, hooks, limits, and runtime metadata |
| Tools | Shows schemas and metadata and can invoke registered tools directly |
| MCP | Shows server/tool origin and can invoke MCP-backed tools |
| Pipelines | Exposes graphs, typed input metadata, runs, logs, stored history, and replay |
| Sessions | Creates, lists, updates, loads, and deletes Studio chat sessions |
| Traces | Records local run/generation/tool trees with status, timing, usage, and request context |
| Knowledge | Inspects static context, dynamic context, dynamic tools, and retrieval evidence |
| Memory | Uses an agent's read-only `MemoryInspector` when available, otherwise Studio session storage |
| Sandboxes | Discovers sessions attached to sandbox tools and exposes read-only files, ports, processes, and bounded logs |
| Status | Reports enabled capabilities, stores, registered targets, and available record counts |
| Evaluations | Registers typed suites and exposes evaluation configuration/run HTTP routes |

## Capability limits

Studio can only show what the runtime exposes. Knowledge inspection is not a document editor. Memory adapters without an inspector cannot expose their durable conversations. Sandbox inspection is read-only, although the registered agent tools may still mutate the sandbox. Runtime status reports configured capabilities, not dependency health checks.

Evaluation runtime routes exist for registered suites; the current primary browser navigation is centered on Playground, Pipelines, Sessions, Traces, and inspection surfaces rather than a dedicated Evaluations page.

Studio traces are local development evidence. Use [Lens](/packages/lens) for retained team observability and evaluation workflows across deployments.

See [runtime boundary](/packages/studio/runtime-boundary) and the [API reference](/packages/studio/api-reference).
