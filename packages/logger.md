# `@anvia/logger`

`@anvia/logger` provides structured logging implementations and an agent observer that translates runtime activity into log records.

## Install

```bash
pnpm add @anvia/core @anvia/logger
```

## Log an agent run

```ts
import { Agent } from '@anvia/core'
import { createConsoleLogger, createLoggerObserver } from '@anvia/logger'

const logger = createConsoleLogger({
  level: 'info',
  name: 'support-agent',
})

const agent = new Agent({
  id: 'support',
  model: model,
  observers: [createLoggerObserver(logger)],
})
```

Use `createPinoLogger` when the application already uses Pino or needs a custom destination stream. Use `logger.child()` to attach stable request, tenant, or service fields without rebuilding them for every call.

## Capture policy

The observer keeps request bodies, responses, model output, and tool results out of logs unless their corresponding options are enabled. Treat those flags as a data-governance decision: payloads can contain prompts, secrets, or personal data.

## Features

- Console and Pino-backed structured loggers.
- Consistent trace through fatal log levels.
- Child loggers with inherited bindings.
- Agent observer integration.
- Independent controls for requests, responses, output, and tool results.

## Compatibility

The package is a server-side logging adapter and declares `@anvia/core` as a peer dependency. Pino is included as a runtime dependency.

## Next steps

- [Get started](/packages/logger/get-started)
- [Capabilities](/packages/logger/capabilities)
- [Data and privacy](/packages/logger/data-and-privacy)
- [Production](/packages/logger/production)
- [Public API](/packages/logger/api-reference)
- [Releases](/packages/logger/releases)
- [Hooks and run control](/sdk/advanced/hooks)
