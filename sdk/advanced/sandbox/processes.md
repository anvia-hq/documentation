# Processes and previews

Use managed processes when a command must continue after launch, such as a development server. Unlike `exec(...)`, `startProcess(...)` returns after the process starts and the session keeps its status and bounded log tail.

## Use a process-capable session

`DockerSandboxSession` supports managed processes. Narrow custom providers may implement only the base `SandboxSession`, so check the capability when code accepts a provider-neutral session:

```ts
import {
  isSandboxProcessSession,
  type SandboxSession,
} from '@anvia/sandbox'

async function startPreview(session: SandboxSession) {
  if (!isSandboxProcessSession(session)) {
    throw new Error('This sandbox provider does not manage processes.')
  }

  return session.startProcess({
    command: 'pnpm',
    args: ['dev', '--host', '0.0.0.0'],
  })
}
```

Keep managed commands in the foreground. Do not add `&`, use `nohup`, or make the command daemonize; the session needs to track its exit and stop it during cleanup.

## Pre-authorize a preview port

Ports are selected when application code creates the session:

```ts
const sandbox = DockerSandbox.node({
  network: true,
  limits: {
    maxProcesses: 2,
    maxOutputBytes: 64_000,
  },
})

const session = await sandbox.createSession({
  ports: [5173],
})
```

Docker publishes each container port on a random host port bound to `127.0.0.1`. The sandbox does not create an authenticated public URL.

## Start and wait from application code

```ts
const process = await session.startProcess({
  command: 'pnpm',
  args: ['dev', '--host', '0.0.0.0'],
  cwd: '.',
})

const published = await session.waitForPort(5173, {
  timeoutMs: 30_000,
})

console.log(process.id)
console.log(`http://${published.host}:${published.hostPort}`)
```

The server must bind to `0.0.0.0` inside the container. Binding to container localhost prevents Docker's published port from reaching it.

Proxy the loopback address through an authenticated application route that verifies tenant and session ownership. Do not return the raw host port as a durable public preview URL.

## Let an agent manage a preview

Process and port tools are opt-in:

```ts
const tools = createSandboxTools(session, {
  include: [
    'list_files',
    'read_file',
    'write_file',
    'exec_command',
    'list_ports',
    'start_process',
    'list_processes',
    'read_process_logs',
    'wait_for_port',
    'stop_process',
  ],
  exec: {
    allowedCommands: ['node', 'pnpm'],
  },
  process: {
    maxLogBytes: 64_000,
    defaultWaitTimeoutMs: 10_000,
    maxWaitTimeoutMs: 30_000,
    stopGracePeriodMs: 5_000,
  },
})

const agent = new AgentBuilder('website-builder', model)
  .instructions([
    'Use only the pre-authorized published port.',
    'Bind the development server to 0.0.0.0.',
    'Wait for the port before reporting that the preview is ready.',
    'Inspect process logs when readiness fails.',
  ].join('\n'))
  .tools(tools)
  .build()
```

The executable allow/block policy also applies to managed processes. The process policy bounds retained logs, readiness waits, and graceful shutdown.

## Inspect and stop processes

```ts
const processes = await session.listProcesses()
const active = processes.find((item) => item.status === 'running')

if (active) {
  const logs = await session.readProcessLogs(active.id, {
    tailBytes: 32_000,
  })

  await previews.recordLogs(job.id, {
    stdout: logs.stdout,
    stderr: logs.stderr,
    truncated: logs.stdoutTruncated || logs.stderrTruncated,
  })

  await session.stopProcess(active.id, {
    gracePeriodMs: 5_000,
  })
}
```

`maxProcesses` caps concurrent managed processes and retained process records. Completed records may be pruned when the limit requires capacity, so persist product status outside the sandbox when it must survive the session.

Destroying the session remains the final cleanup boundary and stops its remaining managed processes.
