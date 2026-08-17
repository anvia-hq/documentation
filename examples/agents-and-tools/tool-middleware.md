# Tool middleware

Tool middleware applies cross-cutting controls after a handler returns but before its result goes back to the model. This example replaces oversized text with a compact reference.

```ts
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Agent, createMiddleware } from '@anvia/core'

const outputGate = createMiddleware({
  async onToolOutput({ toolName, result, internalCallId }) {
    if (result.length <= 1_000) {
      return undefined
    }

    const file = join(tmpdir(), `${toolName}-${internalCallId}.txt`)
    await writeFile(file, result, 'utf8')

    return JSON.stringify({
      type: 'file_reference',
      reason: 'tool_output_too_large',
      chars: result.length,
      path: file,
    })
  },
})

const agent = new Agent({
  id: 'analyst',
  model,
  instructions: 'Use tools when useful. Summarize results briefly.',
  middlewares: [outputGate],
  maxTurns: 2,
  tools: [longReportTool],
})

const result = await agent.generate({
    prompt: 'Create a short update from the onboarding report.'
})
```

Returning `undefined` preserves the original serialized result. Returning a string replaces what the model receives. Middleware can also redact secrets, normalize output, enforce size limits, or create durable references consistently across tools.

The temporary-file example is only suitable for a local demonstration. In distributed production, write to tenant-scoped storage, return an opaque authorized ID, apply expiry and deletion, and never let the model choose storage paths or fetch arbitrary references.

Continue with [tool middleware](/sdk/tools/middleware).
