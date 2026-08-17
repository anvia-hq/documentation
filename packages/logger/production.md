# Production

Create one base logger for the process, derive child loggers for stable application context, and let the observer add run-specific fields.

```ts
const appLogger = createPinoLogger({
  name: 'support-worker',
  level: process.env.LOG_LEVEL === 'debug' ? 'debug' : 'info',
})

const tenantLogger = appLogger.child({ tenantId })
const observer = createLoggerObserver({ logger: tenantLogger })
```

## Operational checklist

- Send JSON logs to stdout unless the hosting platform requires another destination.
- Keep payload capture disabled in production by default.
- Set retention, sampling, and transport backpressure in the logging platform.
- Do not treat successful log writes as proof that a run completed; observe the run-end record.
- Use trace identifiers to correlate logs with an external tracing system.
- Test log serialization with real error causes and large tool arguments.

`Logger` methods return `void`; the observer does not wait for a remote log sink. Durable delivery and flushing are responsibilities of the selected logger transport and process lifecycle.
