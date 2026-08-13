# Tool middleware

**Type:** Pattern

## Outcome

Transform an oversized tool result before it returns to the model. Use middleware for cross-cutting
controls such as size limits, redaction, normalization, or durable references that should apply to
many tools.

## Prerequisites

- A working tool-enabled agent
- `createMiddleware` from `@anvia/core/tool`
- A protected storage boundary for any content moved out of the model context

## Middleware and agent wiring

```ts
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMiddleware } from '@anvia/core/tool'

const outputGate = createMiddleware({
  async onToolOutput({ toolName, result, internalCallId }) {
    if (typeof result !== 'string' || result.length <= 1_000) return undefined

    const path = join(tmpdir(), `${toolName}-${internalCallId}.txt`)
    await writeFile(path, result, 'utf8')

    return JSON.stringify({
      type: 'file_reference',
      chars: result.length,
      path,
    })
  },
})

const agent = new AgentBuilder('analyst', model)
  .tools([longReportTool])
  .middleware(outputGate)
  .defaultMaxTurns(2)
  .build()
```

`model` and `longReportTool` are configured separately. Returning `undefined` preserves the original
output; returning a value replaces what the model receives.

## Run and expected behavior

Prompt the agent to use `longReportTool`. A short string passes through. An output longer than 1,000
characters is written to a file and replaced by compact JSON. The model sees the replacement, not
the original report.

## Boundaries

The temporary-file example is a local demonstration, not a distributed storage design. File paths
may leak infrastructure details and are useless to another host. Do not let a model choose storage
paths or fetch arbitrary references. Redact sensitive data before logging or external storage and
ensure later readers enforce authorization.

In production, write to tenant-scoped object storage, return an opaque authorized ID, apply expiry
and deletion, record hashes and size metadata, and fail closed if mandatory redaction cannot run.

## Source and extensions

Run the complete
[tool-result middleware cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/10-tool-result-middleware.ts).
Next, add MIME-aware storage, secret detection, or per-tool limits.

- [Tool middleware](/sdk/tools/middleware)
- [Hook middleware](/sdk/advanced/hooks/middleware)
