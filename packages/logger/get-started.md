# Get started

Use `@anvia/logger` when agent lifecycle events should enter the same structured logs as the rest of your server.

## Install

```bash
pnpm add @anvia/core @anvia/logger
```

## Attach an observer

```ts
import { Agent } from '@anvia/core'
import { createLoggerObserver, createPinoLogger } from '@anvia/logger'

const logger = createPinoLogger({
  name: 'support-api',
  level: 'info',
  bindings: { environment: process.env.NODE_ENV },
})

const agent = new Agent({
  id: 'support',
  model: model,
  observability: {
    observers: { logger: createLoggerObserver({ logger }) },
  },
})

const result = await agent.generate({
    prompt: 'Where is order A123?'
})

if (result.status === 'approval_required') {
  logger.info('Agent paused for approval', { approval: result.approval })
}
```

The observer creates child loggers for the run and each tool call. Stable trace, session, user, agent, turn, and tool fields can therefore be searched without parsing the message text.

For local development, replace `createPinoLogger` with `createConsoleLogger`. Both implement the same `Logger` contract.

## Choose what to capture

Payload capture is off by default:

```ts
const observer = createLoggerObserver({
  logger,
  includeRequest: false,
  includeResponse: false,
  includeOutput: false,
  includeToolResult: false,
})
```

Enable a field only after deciding whether prompts, tool data, model responses, or personal information may enter your logging system.

## Next

- [Capabilities](/packages/logger/capabilities)
- [Data and privacy](/packages/logger/data-and-privacy)
- [Production](/packages/logger/production)
