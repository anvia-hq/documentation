# Command execution

Commands can be initiated by trusted application code or exposed to the model as `exec_command`. Both execute inside the session, but they have different policy boundaries.

## Run a command from application code

```ts
const result = await session.exec({
  command: 'node',
  args: ['scripts/validate.mjs', 'output/report.json'],
  cwd: '.',
  timeoutMs: 15_000,
})

if (result.exitCode !== 0) {
  throw new Error(`Validation failed: ${result.stderr}`)
}
```

`exec(...)` returns stdout, stderr, duration, exit status, timeout state, abort state, and truncation flags. A non-zero exit code is a command result, not an infrastructure exception. Check it before claiming success.

```ts
if (result.stdoutTruncated || result.stderrTruncated) {
  await jobs.markOutputIncomplete(job.id)
}
```

Infrastructure failures such as an unavailable or destroyed session still throw.

## Stream command output

Use `execStream(...)` when the application needs output while a command is running:

```ts
for await (const event of session.execStream({
  command: 'pnpm',
  args: ['test'],
  timeoutMs: 60_000,
})) {
  if (event.type === 'stdout') {
    await buildLogs.append(job.id, event.text)
  } else if (event.type === 'stderr') {
    await buildLogs.appendError(job.id, event.text)
  } else {
    await builds.recordExit(job.id, event.result.exitCode)
  }
}
```

The final event has type `exit` and contains the same complete result shape returned by `exec(...)`.

## Cancel an application-owned command

Pass an `AbortSignal` when request cancellation or a worker shutdown should stop the command:

```ts
const controller = new AbortController()

worker.onShutdown(() => controller.abort('Worker is shutting down'))

const result = await session.exec({
  command: 'python',
  args: ['analyze.py'],
  timeoutMs: 30_000,
  signal: controller.signal,
})

if (result.aborted) {
  await jobs.markCancelled(job.id)
}
```

Cancellation stops this execution. It does not destroy the session; call `session.destroy()` when the entire workspace is no longer needed.

## Restrict the agent command tool

```ts
const commandTools = createSandboxTools(session, {
  include: ['exec_command'],
  exec: {
    allowedCommands: ['node', 'pnpm'],
    blockedCommands: ['curl', 'ssh', 'rm'],
    defaultTimeoutMs: 10_000,
    maxTimeoutMs: 30_000,
  },
})
```

Prefer a small `allowedCommands` list. A blocklist is useful as defense in depth, but it cannot enumerate every dangerous executable.

Executable allowlisting is only one layer. An allowed runtime such as `node`, a package script, or a test runner can still read files, consume resources, and perform network requests when networking is enabled. Pair the tool policy with container and network controls.

## Avoid shell-shaped work

The execution contract separates `command` from `args`. Prefer that structured form in application code instead of constructing a shell string from user or model input:

```ts
await session.exec({
  command: 'node',
  args: ['scripts/format.mjs', validatedRelativePath],
})
```

Do not interpolate untrusted input into `sh -c`, `bash -c`, package scripts, or another command that reparses a string. Container isolation reduces host exposure but does not remove command-injection risk inside the workspace.

## Bound output and time

Use both sandbox-wide limits and narrower tool limits:

```ts
const sandbox = DockerSandbox.node({
  limits: {
    timeoutMs: 30_000,
    maxOutputBytes: 64_000,
  },
})

const tools = createSandboxTools(session, {
  include: ['exec_command'],
  exec: {
    allowedCommands: ['node'],
    maxTimeoutMs: 15_000,
  },
})
```

The runtime limit protects every session execution. The tool limit further constrains the duration the model may request.
