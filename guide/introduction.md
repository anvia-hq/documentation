# What is an agent runtime?

An agent runtime runs the loop between a model and your application: it sends a request, executes
the tools the model asks for, feeds the results back, and stops at a final answer, an approval, or
a limit. Anvia is that runtime as a small, explicit TypeScript layer. It accepts the dependencies
your application creates—models, tools, memory stores, vector indexes, observers, and
transports—and coordinates them without taking over the rest of your architecture.

## The boundary

Anvia owns:

- Normalized model calls and streaming across providers.
- Agent turns, tool execution, approvals, and run limits.
- Runtime messages, usage, and events.
- Connections to memory, retrieval, observers, durable stores, and transports.

Your application still owns:

- Authentication and authorization, including inside tool handlers.
- Product permissions and data access, including which documents retrieval may return.
- Durable storage, schemas, and migrations.
- Secrets, deployment, and infrastructure.
- The API and interface presented to users.

Create dependencies in application code, inject them into Anvia, and replace them in tests.

## Package map

Packages release independently; install versions whose declared dependency ranges are compatible.

| Layer | Packages |
| --- | --- |
| Runtime | `@anvia/core` for completions, agents, tools, memory and context interfaces, pipelines, evaluations, and streaming. `@anvia/durable` (experimental) for runs that survive restarts. `@anvia/mcp` for MCP clients and transports. |
| Model providers | `@anvia/openai`, `@anvia/azure`, `@anvia/anthropic`, `@anvia/gemini`, `@anvia/mistral`, `@anvia/grok`, and `@anvia/jev` for typed decisions. |
| Memory | `@anvia/memory-sqlite`, `@anvia/memory-postgres`, `@anvia/memory-drizzle`, and `@anvia/memory-prisma`. |
| Knowledge | Vector stores such as `@anvia/pgvector`, `@anvia/qdrant`, and `@anvia/pinecone`; `@anvia/graph` with `@anvia/neo4j` or `@anvia/memgraph` for GraphRAG; `@anvia/transformers` for local embeddings. |
| Application surfaces | `@anvia/client` for the stream protocol, `@anvia/server` for HTTP responses, `@anvia/react` for client state, and `@anvia/react-ui` for headless chat primitives. |
| Observability | `@anvia/logger`, `@anvia/otel`, `@anvia/lens`, and `@anvia/langfuse`. |
| Development tools | `@anvia/studio` for local inspection, `@anvia/sandbox` for isolated command and file tools, and `@anvia/cli` for coding-agent skills and components. |

Messaging adapters for Discord, Slack, and Telegram ship separately as [Channels](/channels/). The
[package catalog](/packages/catalog) lists every package with its reference page.

## Start small

Use a direct completion when your application already owns the control flow. Introduce an agent
when behavior must be reusable, use tools, remember sessions, or span multiple turns. Add durable
execution only when a run must outlive the process that started it.

[Build your first agent](/guide/getting-started)
