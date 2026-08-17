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
