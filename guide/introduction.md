# Introduction

Anvia is a small, explicit runtime layer for AI behavior inside a TypeScript application. It accepts the dependencies your application creates—models, tools, memory stores, vector indexes, observers, services, and transports—and coordinates them without taking over the rest of your architecture.

## The boundary

Anvia owns:

- Normalized model calls and streaming.
- Agent turns and tool execution.
- Runtime messages, usage, and events.
- Connections to memory, context, observers, and transports.

Your application still owns:

- Authentication and authorization.
- Product permissions and data access.
- Durable storage and migrations.
- Deployment and infrastructure.
- The API and interface presented to users.

This boundary keeps application dependencies explicit. Create them in application code, inject them into Anvia, and replace them in tests.

## Runtime layers

`@anvia/core` provides provider-neutral completions, agents, tools, memory interfaces, streaming events, and context.

Provider packages such as `@anvia/openai`, `@anvia/anthropic`, `@anvia/gemini`, and `@anvia/mistral` create models that implement the core interfaces.

Integration packages connect the runtime to application surfaces:

- `@anvia/server` exposes runtime streams from HTTP routes.
- `@anvia/react` consumes streams in React applications.
- `@anvia/logger` sends runtime events to application logs.
- `@anvia/sandbox` provides isolated command and file tools.
- `@anvia/studio` provides a local browser runtime for development.

## Start small

Use a direct completion when your application already owns the control flow. Introduce an agent when behavior must be reusable, use tools, remember sessions, or span multiple turns.

[Build your first agent](/guide/getting-started)
