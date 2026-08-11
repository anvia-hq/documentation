# Tracing

The observer turns Anvia runs, model generations, tools, child agents, errors, usage, and streaming deltas into Langfuse observations.

```ts
const tracing = langfuse.create({
  serviceName: 'support-api',
  environment: 'production',
  release: '2026.08.1',
  captureMode: 'safe',
})
```

`serviceName`, environment, and release make traces easier to filter and compare. Model usage retains cache- and reasoning-aware detail when the provider supplies it.

## Add application events

During an active run, the most recent trace handle can add checkpoints or metadata:

```ts
const trace = tracing.getCurrentTrace()
trace?.addEvent('retrieval.complete', { documentCount: 4 })
trace?.addAttributes({ route: '/support' })
```

The handle is instance-local and last-write-wins. Concurrent runs sharing the same tracing instance can race for `getCurrentTrace()`. For concurrency-sensitive code, pass explicit trace identifiers through application context instead of treating the current handle as request-local storage.
