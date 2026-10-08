# Command execution

Commands can be initiated by trusted application code or exposed to the model as `exec_command`. Both execute inside the sandbox, but they have different policy boundaries.

## Run a command from application code

```ts
const result = await sandbox.runtime.exec({
  command: 'node',
  args: ['scripts/validate.mjs', 'output/report.json'],
  cwd: '.',
  timeoutMs: 15_000,
})

if (result.status === 'timed_out') throw new Error('Validation timed out')
if (result.exitCode !== 0) {
  throw new Error(new TextDecoder().decode(result.stderr))
}
```

`exec()` returns byte stdout/stderr, duration, and truncation flags. Its discriminated result is either `status: 'exited'` with `exitCode`, or `status: 'timed_out'`.

## Stream command output

```ts
const decoder = new TextDecoder()

for await (const event of sandbox.runtime.execStream({
  command: 'pnpm',
  args: ['test'],
  timeoutMs: 60_000,
})) {
  if (event.type === 'stdout') await buildLogs.append(job.id, decoder.decode(event.data))
  else if (event.type === 'stderr') await buildLogs.appendError(job.id, decoder.decode(event.data))
  else await builds.recordResult(job.id, event.result)
}
```

The final event has type `result`.

## Cancel and restrict

Pass `abortSignal` to cancel application-owned work. Cancellation affects the operation; call `sandbox.destroy()` when the entire workspace is no longer needed.

```ts
const commandTools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['exec_command'],
  exec: {
    commands: { mode: 'allow', values: ['node', 'pnpm'] },
    defaultTimeoutMs: 10_000,
    maxTimeoutMs: 30_000,
  },
})
```

Command policy supports either an allow list or a block list. Prefer the structured `command` plus `args` contract; do not interpolate untrusted input into `sh -c` or another string-reparsing command. Pair tool policy with runtime, resource, and network controls.

### Natural command lines

`exec_command` accepts either exact argv input or a complete command line. When `args` is provided, or `command` is a bare executable name, the tool runs that executable with those arguments, with no shell parsing. When `args` is omitted and `command` contains whitespace or shell syntax (pipes, redirects, quotes, globs, variable expansion, multiline scripts), the tool runs it as `sh -c <command>`.

Command policies apply to the implicit `sh` executable for a shell command line. With an allow list, `sh` must therefore be listed and `allowShellInterpreters: true` set, which defeats the purpose of a tight allow list. With a block list, natural command lines are rejected with `Natural command lines cannot be used with block-mode command policies. Use command and args instead.`, because arbitrary shell syntax cannot be checked safely against an executable block list. In both configurations, use exact `command` and `args` input when the policy matters.
