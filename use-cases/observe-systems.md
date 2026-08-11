# Observe systems

Anvia runtime events provide one consistent observation surface across providers, direct model calls, agent turns, and tools.

## Log the lifecycle

```ts
import { createConsoleLogger, createLoggerObserver } from '@anvia/logger'

const logger = createConsoleLogger({
  name: 'support-app',
  level: 'debug',
})

const agent = new AgentBuilder('support', model)
  .observe(createLoggerObserver(logger))
  .build()
```

Use local console logging while developing, then switch to the adapter for the logger your production application already operates.

## What to watch

- Run and turn start/finish events for latency and throughput.
- Tool calls and failures for integration health.
- Final usage for model consumption.
- Error events for failed runs.
- Run and trace identifiers for correlation.

## Data safety

Do not treat observability as authorization. Verify access before an agent runs, and avoid logging message content or tool output unless your data policy explicitly permits it.

The default logger observer is conservative: it omits final output, full model requests and responses, and tool results.

## Inspect locally

`@anvia/studio` provides a browser surface for running agents and inspecting sessions, traces, tools, memory, status, knowledge, pipelines, evaluations, and MCP configuration when those capabilities are enabled.

```ts
import { Studio } from '@anvia/studio'

new Studio([agent]).start({ port: 4021 })
```

Open `http://localhost:4021/playground` and run a prompt against the configured agent.
