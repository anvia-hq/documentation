# Get started

Use `@anvia/logger` when agent lifecycle events should enter the same structured logs as the rest of your server.

## Install

```bash
pnpm add @anvia/core @anvia/logger
```

## Attach an observer

```ts
import { AgentBuilder } from '@anvia/core'
import { createLoggerObserver, createPinoLogger } from '@anvia/logger'

const logger = createPinoLogger({
  name: 'support-api',
  level: 'info',
  bindings: { environment: process.env.NODE_ENV },
})

const agent = new AgentBuilder('support', model)
  .observe(createLoggerObserver(logger))
  .build()

await agent.prompt('Where is order A123?').send()
```

The observer creates child loggers for the run and each tool call. Stable trace, session, user, agent, turn, and tool fields can therefore be searched without parsing the message text.

For local development, replace `createPinoLogger` with `createConsoleLogger`. Both implement the same `Logger` contract.

## Choose what to capture

Payload capture is off by default:

```ts
const observer = createLoggerObserver(logger, {
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
