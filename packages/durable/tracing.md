# Trace durable work

Attach observers to the registered Agent as usual. Each durable run has a stable trace ID across
model retries, crash recovery, resumed interactions, and explicit retries. Replayed model, tool,
and context checkpoints do not emit duplicate spans or observer usage. A goal's later sessions
are separate runs, each with its own trace.

```ts
const run = await runtime.submit({
  agentId: 'assistant',
  sessionId: 'tenant-42:execution-7',
  requestId: 'message-123',
  prompt: 'Investigate the failed deployment.',
  trace: {
    sessionId: 'tenant-42:chat-7',
    name: 'deployment-investigation',
    userId: authenticatedUser.id,
    tags: ['support'],
    metadata: { ticketId: 'ticket-123' },
    version: 'support-v2',
  },
})
```

`DurableTraceOptions` accepts `sessionId`, `name`, `userId`, `tags`, JSON `metadata`, and `version`,
with a 16 KiB serialized limit. `submitTask()`, `submitGoal()`, and `submitRegisteredTask()` also
accept `trace`. Task-owned runs inherit the root task's trace options. Trace context does not
participate in request deduplication; the first accepted submission's value is retained.

`trace.sessionId` groups traces for one application conversation, including goal rounds and
subagents. It defaults to the submitted session. Choose a globally unique, tenant-qualified ID;
backends group by this value alone. It does not merge execution sessions, histories, or ownership.
When they differ, `metadata.durableSessionId` records the execution session.

The runtime owns `durableRunId`, `durableEpoch`, `durableSessionId`, `durableTaskId`,
`durableRootTaskId`, and `durableGraphId` metadata. Application values with those names are dropped.

## OpenTelemetry provider setup

`LensClient` installs the required ID generator automatically. For an application-owned OpenTelemetry
provider, install `createAnviaIdGenerator()` so parentless roots can use the durable trace ID:

```ts
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { createAnviaIdGenerator, createOtelObserver } from '@anvia/otel'

const provider = new NodeTracerProvider({
  idGenerator: createAnviaIdGenerator(),
  // Add your application's span processors and exporter here.
})
provider.register()
const observer = createOtelObserver({ serviceName: 'durable-worker' })
```

Install `@opentelemetry/sdk-trace-node` alongside your chosen exporter. Register the provider before
running agents, attach `observer` through Agent observability, and flush/shut down that provider at
application shutdown. The generator can wrap another `OtelIdGenerator`; it delegates ordinary IDs
to that generator. Without it, resumed attempts can become roots of separate traces and the adapter
logs a diagnostic warning. Explicit parent observation IDs retain their normal parent relationships.

## HTTP trace context

HTTP clients cannot submit `trace`. Configure the handler's `trace(request, resource)` callback to
derive identity and grouping from authenticated application state after authorization. It may be
async and return `DurableTraceOptions` or `undefined`. The callback requires Durable 0.11 or newer;
the `sessionId` override requires 0.12. Never trust client-selected user or tenant IDs without validation.

See [HTTP server and client](/packages/durable/http) and [Lens tracing](/packages/lens/tracing).
