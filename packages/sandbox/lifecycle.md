# Lifecycle

Application code owns every created sandbox. The rc3 API makes image acquisition, creation, pausing, resumption, and destruction explicit.

## Ephemeral workspaces

```ts
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
})

try {
  await runAgentWithWorkspace(sandbox.runtime)
} finally {
  await sandbox.destroy()
}
```

Destroying the sandbox removes its container and owned ephemeral volume. Keep `destroy()` in `finally` around the complete workflow.

`DockerSandbox` also implements `AsyncDisposable`, so runtimes that support explicit resource management can use `await using`:

```ts
await using sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'none' },
})
```

## Existing Docker volumes

```ts
const sandbox = await client.createSandbox({
  id: `project-${project.id}`,
  image: 'node:22-bookworm',
  workspace: {
    type: 'docker-volume',
    name: `anvia-project-${project.id}`,
  },
  network: { mode: 'none' },
})
```

The named volume must already exist. `destroy()` removes the container but does not remove an application-owned Docker volume. Volume authorization, retention, deletion, and concurrency remain application responsibilities.

## Stop and resume

```ts
await sandbox.stop()
const resumed = await client.resumeSandbox({ id: sandbox.id })
```

`stop()` preserves the container for a later `resumeSandbox()` call. `destroy()` is terminal. Persist the sandbox ID only when the application has an authorization and cleanup policy for resumable containers.

Destroying a sandbox also removes managed processes and published port mappings. Studio inspection is read-only and never assumes cleanup ownership.
