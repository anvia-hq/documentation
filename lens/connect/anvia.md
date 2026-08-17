# Anvia SDK

`@anvia/lens` connects an Anvia agent directly to a Lens project. It turns agent runs, model generations, and tool calls into traces without requiring you to configure an OpenTelemetry SDK.

## What the integration provides

Attach one Lens observer to an agent and Lens can show:

- The complete run from prompt to final response.
- A generation for every model turn, including model, duration, status, and usage.
- Tool calls nested under the generation that requested them.
- Errors on the run, generation, or tool where they occurred.
- User, session, tag, version, and custom metadata supplied for the request.

The integration creates its own isolated OpenTelemetry trace and log providers. It does not replace the application's global provider or collect unrelated application spans.

## Connection flow

```text
Anvia agent
    -> Lens observer
    -> authenticated OTLP export
    -> Lens project
    -> Traces, Sessions, and Users
```

The public and secret ingestion keys select the destination project. Keep the integration in the server process that runs the agent; never expose the secret key in browser code.

## Minimal connection

Install the package alongside Anvia Core:

```sh
pnpm add @anvia/lens @anvia/core
```

Add the connection details shown on the Lens project's **Connect** page:

```dotenv
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
ANVIA_LENS_SERVICE_NAME=support-api
ANVIA_LENS_ENVIRONMENT=production
```

Create the observer once, then reuse it across agents in the process:

```ts
import { Agent } from '@anvia/core'
import { LensClient } from '@anvia/lens'

const lens = new LensClient()
const tracing = lens.observer()

const supportAgent = new Agent({
  id: 'support',
  model: model,
  name: 'Support agent',
  observability: { observers: { tracing } },
})

const response = await supportAgent.generate({
    prompt: 'Summarize the latest support request.'
})

if (response.status === 'completed') {
  console.log(response.trace?.traceId)
}
```

The request succeeds independently of when the batch exporter delivers its trace. Flush pending telemetry at the appropriate process boundary; see [Flush and shutdown](/lens/connect/anvia/flush-and-shutdown).

## Where to go next

| Goal | Guide |
| --- | --- |
| Set credentials, service identity, and deployment context | [Configure tracing](/lens/connect/anvia/configure-tracing) |
| Group requests into users and sessions | [Trace context](/lens/connect/anvia/trace-context) |
| Control whether payloads leave the application | [Capture and privacy](/lens/connect/anvia/capture-and-privacy) |
| Deliver buffered telemetry reliably | [Flush and shutdown](/lens/connect/anvia/flush-and-shutdown) |

Evaluation reporting and managed datasets use the same project connection, but they have their own workflow. Continue to [Evaluations](/lens/evaluations) when the goal is measuring quality rather than observing live traffic.
