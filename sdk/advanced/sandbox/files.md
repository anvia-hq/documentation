# File tools and artifacts

Sandbox files have two audiences: text files the agent can inspect or edit, and artifacts the application exports after the run.

## Expose bounded text tools

```ts
const fileTools = createDockerSandboxTools({
  sandbox: sandbox.runtime,
  tools: ['list_files', 'read_file', 'write_file'],
  readFile: { defaultLineCount: 300, maxLineCount: 1_000, maxBytes: 64_000 },
  writeFile: { maxBytes: 256_000 },
})
```

Paths are workspace-relative. `read_file` returns one bounded page of UTF-8 text; binary artifacts should use trusted runtime methods.

## Use runtime methods from trusted code

```ts
await sandbox.runtime.writeTextFile({
  path: 'input/request.json',
  text: JSON.stringify(validatedRequest),
})

const firstPage = await sandbox.runtime.readTextFilePage({
  path: 'logs/build.log',
  startLine: 1,
  lineCount: 250,
  maxBytes: 32_000,
})

const entries = await sandbox.runtime.listFiles({ path: 'output' })
const summary = await sandbox.runtime.readTextFile({ path: 'output/summary.md' })
```

Use `writeFile({ path, data })` and `readFile({ path })` for bytes.

## Export artifacts deliberately

```ts
const artifact = await sandbox.runtime.readFile({ path: 'output/report.pdf' })

await objectStore.put({
  tenantId: job.tenantId,
  key: `reports/${job.id}.pdf`,
  body: artifact,
  contentType: 'application/pdf',
})
```

Validate exact paths and media types, scan artifacts when required, and copy accepted output to tenant-scoped durable storage before destroying an ephemeral sandbox. Map application-owned artifact IDs to reviewed paths instead of exposing arbitrary path reads through an HTTP route.
