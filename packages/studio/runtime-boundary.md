# Runtime boundary

Studio is a trusted local execution surface. It does not provide built-in user authentication, authorization, or TLS.

## Execution authority

A caller who can reach the runtime may be able to:

- run agents with server-side provider credentials;
- invoke registered tools directly;
- approve or reject protected calls and answer questions;
- run and replay pipelines;
- inspect sessions, prompts, results, traces, memory, MCP metadata, and sandbox state.

Schema validation and tool approval do not authorize access to the Studio server. Use test accounts, scoped credentials, non-production data, and least-authority tools.

## UI options are not security controls

`ui: false` removes the bundled shell but keeps runtime APIs. `rootRoutes: false`, `redirectRoot: false`, and a custom `path` change routing only. `protectShell` currently follows the same shell-registration behavior whether enabled or disabled.

If remote access is unavoidable, protect the entire Studio origin with trusted network policy, TLS, and authentication. Do not protect only the HTML route while leaving APIs reachable.

## Process lifecycle

```ts
const shutdown = new AbortController()

await studio.serve({
  hostname: '127.0.0.1',
  port: 4021,
  signal: shutdown.signal,
  onShutdown: async () => {
    await sandbox.destroy()
    await mcpClient.close()
  },
})
```

`serve()` waits for shutdown, closes Studio, then awaits `onShutdown`, including when startup fails. `start()` installs its own `SIGINT` behavior unless `handleSignals: false`; application-owned lifecycles must then call `close()`.

Studio exposes only sandbox inspectors registered through `StudioOptions.sandboxes`; it does not own or destroy their sandboxes. It also does not close provider clients, database pools, MCP connections, or custom observers. Clean those up at the same process boundary.

See [Studio security boundaries](/studio/configure/security-boundaries) and [lifecycle and cleanup](/studio/configure/lifecycle-and-cleanup).
