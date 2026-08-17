# Processes and previews

Use managed processes when a command must continue after launch, such as a development server. `DockerSandboxRuntime` always exposes process and port methods.

## Pre-authorize a preview port

```ts
const sandbox = await client.createSandbox({
  image: 'node:22-bookworm',
  workspace: { type: 'ephemeral' },
  network: { mode: 'bridge', ports: [5173] },
  runtime: { maxProcesses: 2, maxOutputBytes: 64_000 },
})
```

Docker publishes each declared container port on a random host port bound to `127.0.0.1`.

## Start and wait from application code

```ts
const process = await sandbox.runtime.startProcess({
  command: 'pnpm',
  args: ['dev', '--host', '0.0.0.0'],
})

const published = await sandbox.runtime.waitForPort({
  containerPort: 5173,
  timeoutMs: 30_000,
})

console.log(process.id)
console.log(`http://${published.host}:${published.hostPort}`)
```

The server must bind to `0.0.0.0` inside the container. Proxy the loopback address through an authenticated route that verifies tenant and sandbox ownership.

## Let an agent manage a preview

```ts
const tools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: [
    'list_files', 'read_file', 'write_file', 'exec_command',
    'list_ports', 'start_process', 'list_processes',
    'read_process_logs', 'wait_for_port', 'stop_process',
  ],
  exec: { commands: { mode: 'allow', values: ['node', 'pnpm'] } },
  process: {
    maxLogBytes: 64_000,
    defaultWaitTimeoutMs: 10_000,
    maxWaitTimeoutMs: 30_000,
    stopGracePeriodMs: 5_000,
  },
})
```

## Inspect and stop processes

```ts
const processes = await sandbox.runtime.listProcesses()
const active = processes.find((item) => item.status === 'running')

if (active) {
  const logs = await sandbox.runtime.readProcessLogs({
    processId: active.id,
    tailBytes: 32_000,
  })
  await sandbox.runtime.stopProcess({
    processId: active.id,
    gracePeriodMs: 5_000,
  })
}
```

Keep managed commands in the foreground. `destroy()` remains the final cleanup boundary and stops remaining processes.
