# Lifecycle and cleanup

Use `start()` for a conventional local process. Use `serve()` when your application needs to await shutdown and clean up sandboxes, connections, temporary files, or other resources.

## Start and close Studio

`start()` starts the HTTP server and returns the same `Studio` instance:

```ts
import { Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'

const studio = new Studio([supportAgent]).start({
  hostname: '127.0.0.1',
  port: 4021,
})

process.once('SIGTERM', () => {
  studio.close()
})
```

Calling `close()` removes Studio's installed `SIGINT` listener, closes its HTTP server, and releases the current Studio runtime. It is safe to call when the server is already closed.

Calling `start()` again first closes the current server and rebuilds the Studio runtime from the constructor options. In-memory state belongs to the previous runtime and is lost; an external SQLite store preserves its records.

## Decide who owns process signals

By default, `start()` handles `SIGINT`, calls `close()`, and exits the process. Disable that behavior when an application or framework already coordinates shutdown:

```ts
studio.start({
  hostname: '127.0.0.1',
  port: 4021,
  handleSignals: false,
})
```

With `handleSignals: false`, your application must call `close()`. `start()` does not install a `SIGTERM` handler.

## Await the full lifecycle with `serve()`

`serve()` starts the server, waits for a shutdown condition, closes Studio in `finally`, then awaits `onShutdown`:

```ts
const shutdown = new AbortController()

process.once('SIGTERM', () => shutdown.abort())

await studio.serve({
  hostname: '127.0.0.1',
  port: 4021,
  signal: shutdown.signal,
  onShutdown: async () => {
    console.log('Studio cleanup complete')
  },
})
```

`serve()` finishes when its abort signal fires, the process receives `SIGINT` or `SIGTERM`, or an interactive terminal sends Ctrl+C. Its promise does not resolve until asynchronous `onShutdown` work finishes. Cleanup also runs if server startup fails, such as when the port is already in use.

## Clean up sandbox sessions explicitly

Studio discovers sandbox sessions from registered tools so it can inspect their files, ports, processes, and logs. It does not own or destroy those sessions.

Keep creation and cleanup in the same entry point:

```ts
import { DockerSandbox } from '@anvia/sandbox'
import { Studio } from '@anvia/studio'

const sandbox = DockerSandbox.node()
const session = await sandbox.createSession()
const studio = new Studio()

try {
  await studio.serve({
    hostname: '127.0.0.1',
    port: 4021,
    onShutdown: async () => {
      await session.destroy()
    },
  })
} catch (error) {
  await session.destroy().catch(() => undefined)
  throw error
}
```

The `catch` covers failures that happen outside the normal serving lifecycle. Apply the same ownership pattern to MCP clients, worker processes, temporary directories, and any resource created for the Studio process.

See [Sandboxes](/studio/sandboxes) for the inspection surface and [Storage and persistence](/studio/configure/storage-and-persistence) for state that should survive a restart.

