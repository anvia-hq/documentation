# Sessions and cleanup

A session is the live isolation boundary: one Docker container plus a workspace volume. Its lifetime should follow an application task, not an agent turn.

## Prefer ephemeral workspaces

Ephemeral is the default and the safest fit for request- or job-scoped work:

```ts
const session = await sandbox.createSession({
  workspace: { mode: 'ephemeral' },
  metadata: {
    jobId: job.id,
    tenantId: job.tenantId,
  },
})
```

Destroying the session removes its container and ephemeral volume. Export required artifacts first.

## Guarantee cleanup

Create the session immediately before the isolated work and destroy it in `finally`:

```ts
const session = await sandbox.createSession()

try {
  const agent = createWorkspaceAgent(session)
  const result = await agent.prompt(task).send()
  const artifact = await exportArtifact(session)

  return { result, artifact }
} finally {
  await session.destroy()
}
```

This handles model failures, command failures, rejected artifact validation, and application exceptions. Make `destroy()` the responsibility of the code that created the session.

## Add lifecycle backstops

```ts
const sandbox = DockerSandbox.node({
  lifecycle: {
    ttlMs: 30 * 60_000,
    idleTimeoutMs: 5 * 60_000,
    autoDestroy: true,
  },
})
```

| Control | Purpose |
| --- | --- |
| `ttlMs` | Caps total session lifetime. |
| `idleTimeoutMs` | Cleans up sessions that stop receiving activity. |
| `autoDestroy` | Enables lifecycle-triggered destruction. |

Treat these controls as leak protection, not a substitute for explicit cleanup. Choose values that cover legitimate work without leaving abandoned containers running indefinitely.

## Use persistent workspaces intentionally

A persistent workspace lets later sessions reopen the same volume:

```ts
const session = await sandbox.createSession({
  workspace: {
    mode: 'persistent',
    id: `project-${project.id}`,
    destroyOnSessionDestroy: false,
  },
})
```

Destroying this session stops and removes its container while preserving the named workspace for a later session. That persistence creates product responsibilities:

- scope the workspace ID to one tenant and project
- authorize every reopen
- prevent concurrent writers unless the workflow supports them
- define retention and deletion outside agent instructions
- scan files before moving them to another trust boundary
- provide a separate administrative cleanup path for retained volumes

Set `destroyOnSessionDestroy: true` when the named workspace should be removed with the session.

## Do not equate session and conversation

An Anvia memory session stores conversation history. A sandbox session stores live processes and workspace files. They can share a product job or project ID, but they are separate resources with separate retention.

```text
conversation memory ── messages and generation metadata
sandbox session ────── container, processes, workspace files
product database ───── ownership, status, artifact references
```

Do not rely on memory deletion to remove sandbox data or on sandbox destruction to remove a transcript.

## Inspect without transferring ownership

When sandbox tools are attached to an agent registered in Studio, Studio can discover the live session for read-only inspection. Stopping Studio does not destroy the sandbox, and Studio does not persist its files or process state.

The application that created the session remains responsible for cleanup.

## Plan for process termination

Managed processes belong to the session. Explicit destruction, TTL, and idle cleanup stop them with the container. Keep managed commands in the foreground rather than daemonizing so the session can track status, collect logs, and stop them reliably.
