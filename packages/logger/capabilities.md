# Capabilities

`@anvia/logger` has two responsibilities: provide small structured-logger implementations and translate Anvia observer events into log records.

## Logger implementations

| Factory | Best for | Output |
| --- | --- | --- |
| `createConsoleLogger()` | Development and simple runtimes | Native console methods |
| `createPinoLogger()` | Structured production logging | Pino JSON records |

Both support `trace`, `debug`, `info`, `warn`, `error`, `fatal`, and `child(bindings)`.

## Observer events

The observer records:

- Run start, completion, failure, usage, and message count.
- Generation start, completion, failure, provider, model, usage, and first-delta timing.
- Tool start, stream events, completion, failure, and skipped status.
- Trace, user, session, turn, and call identifiers when the runtime provides them.

Tool arguments are recorded on tool start. Full generation requests, responses, final output, and tool results require explicit capture flags.

## Boundaries

The package does not rotate files, ship logs, sample events, redact arbitrary values, or configure a vendor backend. Configure those concerns in Pino, the destination transport, or your hosting platform. It is a logging adapter, not a tracing backend: use [OpenTelemetry](/packages/otel) when parent-child spans and distributed trace correlation are required.
