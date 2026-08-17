# Lifecycle and cleanup

A `DockerSandbox` handle owns one container and its runtime. Its lifetime should follow an application task, not an agent turn.

## Prefer ephemeral workspaces

```ts
const sandbox = await client.createSandbox({
  id: `job-${job.id}`,
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
  labels: { jobId: job.id, tenantId: job.tenantId },
})
```

Destroying the sandbox removes its container and owned ephemeral volume. Export required artifacts first.

## Guarantee cleanup

```ts
const sandbox = await client.createSandbox(options)

try {
  const agent = createWorkspaceAgent(sandbox.runtime)
  const result = await agent.generate({ prompt: task })
  const artifact = await exportArtifact(sandbox.runtime)
  return { result, artifact }
} finally {
  await sandbox.destroy()
}
```

`DockerSandbox` implements `AsyncDisposable`, so `await using sandbox = await client.createSandbox(options)` is also supported.

## Stop and resume intentionally

```ts
await sandbox.stop()
const resumed = await client.resumeSandbox({ id: sandbox.id })
```

Stopping preserves the container. Resumption restarts it and returns a new handle. Destroying is terminal. The application must retain and authorize IDs and reconcile stopped containers after crashes.

## Reuse an application-owned volume

```ts
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: {
    type: 'docker-volume',
    name: `anvia-project-${project.id}`,
  },
  network: { mode: 'none' },
})
```

The volume must already exist and survives sandbox destruction. Scope names to a tenant and project, authorize every use, prevent unsupported concurrent writers, and define a separate retention/deletion path.

Conversation memory and sandbox state are separate resources. Deleting one does not delete the other. Studio can inspect an explicitly registered inspector but does not own the sandbox lifecycle.
