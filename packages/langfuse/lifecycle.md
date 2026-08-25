# Lifecycle

Create one `LangfuseClient` for the process or worker and derive observers and service clients from it.

```ts
const langfuse = new LangfuseClient()
const tracing = langfuse.observer({ captureMode: 'safe' })

try {
  await runWork(tracing)
  await langfuse.flush()
} finally {
  await langfuse.close()
}
```

`flush()` drains traces and queued scores without closing the client. `close()` performs final delivery and resource shutdown. Do not create one client per request in a long-running service.

Process signals do not unwind an `await using` scope. On `SIGINT` or `SIGTERM`, stop accepting work,
abort and await active Agent runs, then call `langfuse.close()`. Core can then finish each root
observation with `status: 'cancelled'` before Langfuse flushes it. When Studio owns the runs, put
`langfuse.close()` in `Studio.serve({ onShutdown })`.
