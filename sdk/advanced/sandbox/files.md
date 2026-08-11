# File tools and artifacts

Sandbox files have two audiences: text files the agent can inspect or edit, and artifacts the application exports after the run. Keep those paths separate.

## Expose bounded text tools

```ts
const fileTools = createSandboxTools(session, {
  include: ['list_files', 'read_file', 'write_file'],
  readFile: {
    defaultLineCount: 300,
    maxLineCount: 1_000,
    maxBytes: 64_000,
  },
  writeFile: {
    maxBytes: 256_000,
  },
})
```

| Tool | Model-facing purpose |
| --- | --- |
| `list_files` | Inspect workspace-relative file entries. |
| `read_file` | Read a bounded page of a text file. |
| `write_file` | Write text within the configured byte limit. |

Absolute paths and paths that traverse outside the workspace are rejected. This protects the sandbox boundary, but it does not decide which in-workspace files a tenant is allowed to see. Seed only files authorized for that run.

## Read large files by page

`read_file` returns page metadata instead of placing an entire large file in the tool result. Its line numbers are one-based. When `nextStartLine` is present, the next tool call should use that value as `startLine`.

Trusted application code can use the same bounded operation on Docker sessions:

```ts
const readPage = session.readTextFilePage?.bind(session)

if (readPage === undefined) {
  throw new Error('This sandbox provider does not support bounded reads.')
}

const firstPage = await readPage('logs/build.log', {
  startLine: 1,
  lineCount: 250,
  maxBytes: 32_000,
})

if (firstPage.nextStartLine !== null) {
  const nextPage = await readPage('logs/build.log', {
    startLine: firstPage.nextStartLine,
    lineCount: 250,
    maxBytes: 32_000,
  })
}
```

`readTextFilePage` is optional on the provider-neutral `SandboxSession` interface. `DockerSandboxSession` implements it; a custom provider may fall back to `readTextFile(...)` for the agent tool.

## Use session methods for trusted setup

Application code does not need to go through a model-facing tool:

```ts
await session.writeTextFile(
  'input/request.json',
  JSON.stringify(validatedRequest),
)

const entries = await session.listFiles('output')
const summary = await session.readTextFile('output/summary.md')
```

Use `writeFile(...)` and `readFile(...)` for bytes:

```ts
await session.writeFile('input/logo.png', logoBytes)
const reportBytes = await session.readFile('output/report.pdf')
```

The agent tools are text-oriented. Do not ask `read_file` to carry a PDF, image, archive, or other binary content through the model transcript.

## Export artifacts deliberately

Keep generated artifacts under a predictable directory such as `output/` or `artifacts/`. After the agent finishes:

1. List the expected directory from trusted application code.
2. Validate the exact relative path and allowed media type.
3. Read bytes through `session.readFile(...)`.
4. Scan or validate the artifact when required by product policy.
5. Copy it to tenant-scoped durable storage.
6. Return a product-owned download URL.

```ts
const artifactPath = 'output/report.pdf'
const artifact = await session.readFile(artifactPath)

const stored = await objectStore.put({
  tenantId: job.tenantId,
  key: `reports/${job.id}.pdf`,
  body: artifact,
  contentType: 'application/pdf',
})
```

Sandbox files disappear with an ephemeral workspace. Never use the live container or volume as the durable product record.

## Do not expose arbitrary paths

Avoid routes that accept a sandbox path and return it directly. Even though traversal is rejected by the session, such a route can still expose another authorized file inside the workspace.

Map application-owned artifact IDs to reviewed sandbox paths instead:

```ts
const artifactPaths = {
  report: 'output/report.pdf',
  preview: 'output/preview.png',
} as const

type ArtifactName = keyof typeof artifactPaths

async function readArtifact(requestedArtifact: ArtifactName) {
  const path = artifactPaths[requestedArtifact]
  return session.readFile(path)
}
```

Allowlisted identifiers make authorization, content types, caching, and audit behavior explicit.
