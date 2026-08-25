# Lifecycle and cleanup

Use `start()` for a conventional local process. Use `serve()` or `shutdown()` when your application
must await active-run cancellation and observer finalization before closing observability providers,
sandboxes, connections, temporary files, or other resources.

## Start and close Studio

`start()` starts the HTTP server and returns the same `Studio` instance:

```ts
import { Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'

const studio = new Studio([supportAgent]).start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

By default, `start()` installs both `SIGINT` and `SIGTERM` handlers. A signal stops new work, aborts
active Agent and Pipeline runs, waits for their cancellation observers, and applies the shutdown
timeout.

Call `shutdown()` when application code initiates the same graceful path:

```ts
await studio.shutdown({ timeoutMs: 30_000 })
```

`close()` remains safe and idempotent, but it is synchronous: it aborts active work without waiting
for observers to finish. Use it only when graceful delivery is not required.

Calling `start()` again first closes the current server and rebuilds the Studio runtime from the constructor options. In-memory state belongs to the previous runtime and is lost; an external SQLite store preserves its records.

## Decide who owns process signals

Disable Studio's signal handlers when an application or framework already coordinates shutdown:

```ts
studio.start({
  hostname: '127.0.0.1',
  port: 4021,
  handleSignals: false,
})
```

With `handleSignals: false`, your application must await `shutdown()` or call `close()` itself.

## Await the full lifecycle with `serve()`

`serve()` starts the server, waits for a shutdown condition, drains Studio, then awaits `onShutdown`:

```ts
await studio.serve({
  hostname: '127.0.0.1',
  port: 4021,
  shutdownTimeoutMs: 30_000,
  onShutdown: async () => {
    await Promise.all([lens.close(), langfuse.close(), otelSdk.shutdown()])
  },
})
```

`serve()` finishes when its abort signal fires or the process receives `SIGINT` or `SIGTERM`. Its
promise does not resolve until active-run cancellation observers and asynchronous `onShutdown` work
finish. Close observability providers in `onShutdown`, after Studio has finalized root observations
as `cancelled`. Cleanup also runs if server startup fails, such as when the port is already in use.

## Clean up sandbox sessions explicitly

Studio inspects only sandbox inspectors supplied explicitly through `StudioOptions.sandboxes`. It does not own or destroy the underlying sessions.

Keep creation and cleanup in the same entry point:

```ts
import { DockerSandboxClient } from '@anvia/sandbox'
import { Studio } from '@anvia/studio'

const client = new DockerSandboxClient()
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
})
const studio = new Studio([], {
  sandboxes: [{
    inspector: sandbox.inspector({ files: true, ports: true, processes: true }),
  }],
})

try {
  await studio.serve({
    hostname: '127.0.0.1',
    port: 4021,
    onShutdown: async () => {
      await sandbox.destroy()
    },
  })
} catch (error) {
  await sandbox.destroy().catch(() => undefined)
  throw error
}
```

The `catch` covers failures that happen outside the normal serving lifecycle. Apply the same ownership pattern to MCP clients, worker processes, temporary directories, and any resource created for the Studio process.

See [Sandboxes](/studio/sandboxes) for the inspection surface and [Storage and persistence](/studio/configure/storage-and-persistence) for state that should survive a restart.
