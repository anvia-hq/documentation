# Flush and shutdown

`@anvia/lens` batches traces and evaluation logs before export. Your application must give the exporter time to deliver buffered telemetry when a short-lived process exits or a server shuts down.

## `flush()` and `shutdown()` are different

| Method | What it does | Can the observer be used afterward? |
| --- | --- | --- |
| `flush()` | Waits for currently buffered traces and logs to be exported. | Yes |
| `shutdown()` | Performs final provider shutdown and releases exporter resources. | No new work should use it |

`shutdown()` is idempotent: repeated calls share the same shutdown operation.

Neither method closes your Lens deployment or stops an agent request. They manage only the local tracing providers created by `lens.create()`.

## Short-lived scripts

Flush after the last successful request when the script needs the trace immediately, and always shut down in `finally`:

```ts
const tracing = lens.create()
const agent = new AgentBuilder('support-check', model)
  .observe(tracing)
  .build()

try {
  const response = await agent.prompt('Run the support smoke test.').send()
  await tracing.flush()

  console.log(response.trace?.traceId)
} finally {
  await tracing.shutdown()
}
```

Calling only `.send()` is not enough for a command-line script. The agent response means the run completed; it does not mean the batch exporter has finished its network request.

## Long-running servers

Do not flush after every web request. That defeats batching and adds export latency to the request path. Register shutdown once at the process boundary instead:

```ts
const tracing = lens.create()
let stopping = false

async function stop(signal: string) {
  if (stopping) return
  stopping = true

  applicationLogger.info({ signal }, 'shutting down')

  await stopApplicationServer()
  await tracing.shutdown()
}

process.once('SIGTERM', () => {
  void stop('SIGTERM')
})

process.once('SIGINT', () => {
  void stop('SIGINT')
})
```

Here, `stopApplicationServer()` represents your framework's graceful close function: it stops accepting work and waits for active requests to finish. Complete that step before shutting tracing down.

The export timeout defaults to 30 seconds and can be adjusted with `timeoutMs` when creating tracing:

```ts
const tracing = lens.create({ timeoutMs: 10_000 })
```

Choose a value that fits inside the platform's termination grace period.

## Background jobs and serverless handlers

For a worker process that handles many jobs, keep one observer alive across jobs and shut it down with the worker. For a truly short-lived invocation, flush before returning only when delivery cannot wait for a later invocation:

```ts
export async function runJob(input: JobInput) {
  const response = await agent.prompt(input.message).send()
  await tracing.flush()
  return response.output
}
```

Avoid creating and shutting down a new observer for every request in a normal server. Initialize it at module or application startup so batching and connection resources are shared.

## Evaluation scripts

`lens.evals()` packages an observer and reporter together and enables run-end flushing by default. It also exposes `flush()` and `shutdown()` for the script lifecycle. The lower-level evaluation reporter can use `flushOnRunEnd: true` when tracing is already configured.

See [Evaluations](/lens/evaluations) for the complete reporter, observed-agent, and dataset setup.

## Diagnose missing final traces

When the newest traces are consistently absent but older traffic appears:

1. Confirm the shutdown handler actually awaits `tracing.shutdown()`.
2. Ensure the platform gives the process enough termination time.
3. Stop accepting work before shutting down tracing.
4. Check application logs for an exporter timeout or network failure.
5. Run one controlled request followed by `await tracing.flush()` and search its returned trace id.

For normal investigation after delivery, continue to [Traces](/lens/observability/traces).
