# Configure tracing

Create one Lens tracing instance when the server process starts. Configuration may come from environment variables, explicit options, or both.

## Create an ingestion key

Open the project in Lens, choose **Connect**, then create or select an ingestion key in **Project settings**. A key pair belongs to one project.

Store both values in the server-side secret manager used by the application:

```dotenv
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
ANVIA_LENS_SERVICE_NAME=support-api
ANVIA_LENS_ENVIRONMENT=production
ANVIA_LENS_RELEASE=2026.08.11
```

`ANVIA_LENS_BASE_URL` is the same origin used to open Lens in a browser. Do not append `/api` or an OTLP endpoint; `@anvia/lens` constructs the trace and log ingestion paths.

## Configuration reference

| Option | Environment variable | Default | Purpose |
| --- | --- | --- | --- |
| `baseUrl` | `ANVIA_LENS_BASE_URL` | Required | Browser-facing Lens origin. |
| `publicKey` | `ANVIA_LENS_PUBLIC_KEY` | Required | Identifies the destination project. |
| `secretKey` | `ANVIA_LENS_SECRET_KEY` | Required | Authenticates ingestion. |
| `serviceName` | `ANVIA_LENS_SERVICE_NAME` | Required | Stable name of the emitting application or service. |
| `environment` | `ANVIA_LENS_ENVIRONMENT` | `NODE_ENV`, then `default` | Deployment stage such as `development`, `staging`, or `production`. |
| `release` | `ANVIA_LENS_RELEASE` | None | Immutable deployed version, commonly a build number or Git SHA. |
| `timeoutMs` | — | `30000` | Export request and force-flush timeout in milliseconds. |
| `captureMode` | — | `safe` | Whether trace payload bodies are exported. |
| `captureMaxBytes` | — | `262144` | Per captured value limit in bytes. |

Explicit options take precedence over environment variables:

```ts
import { LensClient } from '@anvia/lens'

export const lens = new LensClient({
  serviceName: 'support-api',
  environment: 'production',
  release: process.env.GIT_SHA,
  timeoutMs: 15_000,
})
export const tracing = lens.observer()
```

Prefer environment variables for credentials and explicit options for application-owned settings. This keeps secrets outside the source while making service identity visible in code.

## Choose stable dimensions

Use a stable `serviceName` for one deployable service. Do not include pod ids, hostnames, or release numbers in it; Lens already has dedicated environment and release dimensions.

Good values are `support-api`, `checkout-worker`, or `agent-evals`. Set `environment` to the deployment stage and `release` to the exact deployed artifact. Together they make production-versus-staging filters and release comparisons meaningful.

## Attach one observer to multiple agents

One tracing instance can observe multiple agents in the same process:

```ts
const supportAgent = new Agent({
  id: 'support',
  model: supportModel,
  observability: { observers: { tracing } },
})

const triageAgent = new Agent({
  id: 'triage',
  model: triageModel,
  observability: { observers: { tracing } },
})
```

The agent id and name distinguish their traces. Sharing the observer also gives the process one place to flush and shut down its exporters.

## Make Lens optional in local environments

Use `optional: true` when the integration is optional outside deployed environments:

```ts
const lens = new LensClient({
  optional: true,
  serviceName: 'support-api',
})
const tracing = lens.observer()

console.log(lens.enabled)
```

When all three connection variables—base URL, public key, and secret key—are absent, `optional: true` returns a disabled no-op observer. Partial connection configuration still throws, which prevents a mistyped deployment from silently losing telemetry.

Use `lens.enabled` only for diagnostics or optional UI behavior. The disabled observer is safe to include in `observers` directly.

## Verify the connection

Run one agent request, flush the observer, then open **Traces** with the 24-hour range and no filters:

```ts
const response = await supportAgent.generate({
    prompt: 'Connection check'
})
await lens.flush()

if (response.status === 'completed') {
  console.log(response.trace?.traceId)
}
```

The printed trace id should match the trace detail in Lens. If nothing appears, check that the key pair is active and belongs to the intended project, the base URL has no extra path, and the application can reach Lens over the network.

Next, add request-level identity with [Trace context](/lens/connect/anvia/trace-context).
