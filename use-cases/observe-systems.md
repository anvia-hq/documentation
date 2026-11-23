# Observe systems

Anvia runtime events provide one consistent observation surface across providers, direct model calls, agent turns, and tools.

## Log the lifecycle

```ts
import { createConsoleLogger, createLoggerObserver } from '@anvia/logger'

const logger = createConsoleLogger({
  name: 'support-app',
  level: 'debug',
})

const agent = new Agent({
  id: 'support',
  model: model,
  observability: {
    observers: { logger: createLoggerObserver({ logger }) },
  },
})
```

Use local console logging while developing, then switch to the adapter for the logger your production application already operates.

## What to watch

- Run and turn start/finish events for latency and throughput.
- Pipeline run and stage spans for orchestration latency and branch failures.
- Tool calls and failures for integration health.
- Final usage for model consumption.
- Error events for failed runs.
- Run and trace identifiers for correlation.
- Runtime score distributions and end-user feedback trends for product quality.

## Data safety

Do not treat observability as authorization. Verify access before an agent runs, and avoid logging message content or tool output unless your data policy explicitly permits it.

The default logger observer is conservative: it omits final output, full model requests and responses, and tool results.

For production traces that include Pipelines, pair the backend's Pipeline observer with its Agent
observer and give both configurations the same `primaryTrace` name. This produces one trace from the
Pipeline root through Agent generations and tools. `@anvia/otel` exposes
`createOtelPipelineObserver()`; `LensClient` exposes `pipelineObserver()`.

For feedback or automated production checks, record a trace-correlated runtime score with
`createOtelScorer()` or `LensClient.score()`. A Boolean `1`/`0` can represent like/dislike, while
numeric and categorical scores support richer product signals. Mark authenticated user-submitted
feedback with `source: 'end_user'`; this provenance is observable metadata, not authorization.

## Inspect retained production activity

Connect [your first Lens trace](/lens/your-first-trace), then use [Traces](/lens/observability/traces) to investigate model/tool work, [runtime scoring](/packages/lens/runtime-scoring) for feedback, and [Alerts](/lens/observability/alerts) for regressions. Supported [notification channels](/lens/observability/alerts/channels) deliver incident-opening events; [System Health](/lens/self-hosting/system-health) diagnoses ingestion and worker backlogs.

Project separation does not isolate human access: workspace members can inspect all projects in their workspace. Review capture, [membership](/lens/workspace/members-and-roles), and retention together before retaining production payloads.

## Inspect locally

`@anvia/studio` provides a browser surface for running agents and inspecting sessions, traces, tools, memory, status, knowledge, pipelines, evaluations, and MCP configuration when those capabilities are enabled.

```ts
import { Studio } from '@anvia/studio'

new Studio([agent]).start({ port: 4021 })
```

Open `http://localhost:4021/playground` and run a prompt against the configured agent.
