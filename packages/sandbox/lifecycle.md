# Lifecycle

Application code owns every created session. Lifecycle timers reduce leaks but do not replace explicit cleanup.

## Ephemeral workspaces

Ephemeral mode is the default. Destroying the session removes the container and its ephemeral workspace resources.

```ts
const session = await sandbox.createSession()

try {
  await runAgentWithWorkspace(session)
} finally {
  await session.destroy()
}
```

Keep `destroy()` in `finally` around the complete workflow, including failures during tools, previews, or result handling.

## Automatic cleanup

```ts
const sandbox = DockerSandbox.node({
  lifecycle: {
    autoDestroy: true,
    ttlMs: 30 * 60_000,
    idleTimeoutMs: 5 * 60_000,
  },
})
```

`autoDestroy` defaults to true, but a timer exists only when TTL or idle timeout is configured. TTL measures total session lifetime. Idle cleanup follows public sandbox activity; a managed process running without API activity does not by itself keep the session alive.

## Persistent workspaces

```ts
const session = await sandbox.createSession({
  workspace: {
    mode: 'persistent',
    id: 'project-42',
    destroyOnSessionDestroy: false,
  },
})
```

A named persistent workspace can be reused by later sessions. Its volume survives session destruction by default. Set `destroyOnSessionDestroy: true` only when the name is used for a bounded session and data should be deleted with it.

Persistent workspace IDs need an application retention and ownership policy. They are identifiers, not authorization. Avoid deriving them directly from untrusted user input.

## Processes and ports

Destroying the session removes its container, managed processes, and published port mappings. Published ports are bound to `127.0.0.1`, but the application still owns any proxy that exposes them beyond the host.

When Studio inspects a sandbox, Studio remains read-only and does not destroy it. Use Studio's `serve({ onShutdown })` or the owning service's shutdown path to call `session.destroy()`.
