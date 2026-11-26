# Lifecycle

Application code owns every created sandbox. The v1 API makes image acquisition, creation, pausing, resumption, and destruction explicit.

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

To clean up without a live handle, such as after an application restart, list containers with `client.listSandboxes()` and remove one with `client.destroySandbox({ id, ignoreNotFound: true })`. `client.ensureImage({ image })` pulls only when `client.hasImage({ image })` is false.

Destroying a sandbox also removes managed processes and published port mappings. Studio inspection is read-only and never assumes cleanup ownership.

## Remote sandboxes

`RemoteSandboxHub` authorizes and routes daemons; it has no `create`, `stop`, or `destroy` method. Provisioning, teardown, token issuance, and reconciliation of workloads that outlive a control-plane process remain application responsibilities.

The daemon outlives the control plane. Restarting the control plane only reconnects daemons; their processes keep running. When your lifecycle code destroys a sandbox, call `hub.forget(id)` so a long-lived hub does not keep one record per sandbox id. `forget()` disconnects that sandbox's daemon and drops the runtime, configured workdir, and last reported workdir. A runtime object you still hold keeps working if the daemon connects again.

`RemoteSandboxHub` and `SandboxDaemon` implement `AsyncDisposable`, so `await using` closes them. Use `hub.waitForConnection(id)` to wait for a daemon after provisioning, and the `onConnect` and `onDisconnect` hub options to track daemons.

See [Remote sandboxes](/sdk/advanced/sandbox/remote) for the token model and disconnected behavior.
