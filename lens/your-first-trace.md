# Your first trace

Attach one Lens observer to an Anvia agent, send a request, and open the resulting trace in Lens. A trace represents the complete request; observations inside it show the agent, model generations, and tool calls that performed the work.

## Before you start

You need:

- a running Lens workspace and project;
- a project public and secret ingestion key;
- `@anvia/lens` installed in the server application;
- an Anvia agent with a configured completion model.

Complete [Install and setup](/lens/install-and-setup) first if you do not have the Lens project credentials.

## Create the tracing instance

Initialize tracing once during application startup and reuse it across agents and requests:

```ts
import { lens } from '@anvia/lens'

export const tracing = lens.create()
```

`lens.create()` reads the `ANVIA_LENS_*` environment variables. Its default safe capture mode exports structure, status, duration, model, and available token information while omitting prompt and response bodies.

## Observe an agent

Attach the tracing instance when constructing the agent:

```ts
import { Agent } from '@anvia/core/agent'
import { tracing } from './tracing'
import { model } from './model'

const supportAgent = new Agent({
  id: 'support-agent',
  model: model,
  name: 'Support agent',
  instructions: 'Answer support questions clearly and concisely.',
  observers: [tracing],
})
```

The observer records runtime activity without changing the agent result.

## Send one request

```ts
try {
  const response = await supportAgent
    .prompt('Why does observability matter for an AI agent?')
    .withTrace({
      name: 'explain-observability',
      userId: 'user_42',
      sessionId: 'getting-started',
      tags: ['docs', 'first-trace'],
      metadata: {
        source: 'lens-getting-started',
      },
    })
    .send()

  await tracing.flush()

  console.log(response.output)
  console.log(response.trace?.traceId)
} finally {
  await tracing.shutdown()
}
```

`withTrace(...)` adds investigation context:

| Field | How Lens uses it |
| --- | --- |
| `name` | Gives the request a recognizable trace name. |
| `userId` | Connects activity in the Users view. |
| `sessionId` | Groups related requests into one session. |
| `tags` | Adds filterable operational labels. |
| `metadata` | Preserves structured context for investigation. |

Use application identifiers, not email addresses or other personal values. Do not place secrets in searchable tags or metadata.

## Find the trace

1. Open the project in Lens.
2. Select **Traces**.
3. Keep the time range at **24h** and clear active filters.
4. Open `explain-observability`, or search using the trace ID printed by the application.
5. Expand the observation tree and select the generation.

You should see the agent and model work, their status and duration, and any available model or token attributes. The input and output panels remain empty in safe capture mode by design.

If the trace is missing, confirm that the application uses the correct Lens origin and a matching active key pair. Then call `flush()` and inspect the application process for exporter errors.

## Flush and shutdown correctly

Lens exports telemetry in batches:

- `flush()` delivers buffered telemetry while keeping the tracing instance usable.
- `shutdown()` performs final delivery and releases resources. Do not reuse the instance afterward.

Long-running servers should reuse one tracing instance and call `shutdown()` from their graceful termination path. Short-lived scripts should flush after their final request and shut down in `finally`, as in the example above.

## About full capture

The Lens repository examples use synthetic data and enable payload capture explicitly:

```ts
const tracing = lens.create({ captureMode: 'full' })
```

Do not copy this into production automatically. Full capture can export prompts, responses, tool arguments, and tool results. Enable it only after redaction, project access, and retention have been reviewed.

Next, learn how Lens relates this trace to the rest of the system in [Core concepts](/lens/core-concepts), then configure production context and capture policy under [Connect Anvia](/lens/connect/anvia).
