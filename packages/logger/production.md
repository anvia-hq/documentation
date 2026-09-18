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

For process-local newline-delimited JSON with crash-resistant synchronous writes:

```ts
const fileLogger = createPinoLogger({
  filePath: './var/log/anvia.ndjson',
})

await fileLogger.flush()
```

`sync` and parent-directory creation default to `true`; files are appended by default. Set
`sync: false` for higher throughput and call `flush()` during graceful shutdown.

## Operational checklist

- Send JSON logs to stdout unless the hosting platform requires another destination.
- Keep payload capture disabled in production by default.
- Set retention, sampling, and transport backpressure in the logging platform.
- Do not treat successful log writes as proof that a run completed; observe the run-end record.
- Use trace identifiers to correlate logs with an external tracing system.
- Test log serialization with real error causes and large tool arguments.

Logging methods return `void`; the observer does not wait for a remote sink. Both built-in factories
return a `FlushableLogger`. Custom `Logger` implementations may expose the optional `flush()` method;
durable delivery remains the selected transport's and process lifecycle's responsibility.
