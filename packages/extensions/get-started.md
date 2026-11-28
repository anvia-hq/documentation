# Get started with `@anvia/extensions`

This page builds one agent that reads a workspace, never leaks credentials in its answers, keeps tool
output small, and reports usage after each run.

## Install

```sh
pnpm add @anvia/core @anvia/openai @anvia/extensions zod
```

Any provider package works; this example uses OpenAI. Run it on Node.js 20.3 or newer.

## Build the agent

```ts anvia-check
import { Agent } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { filesystem } from '@anvia/extensions/tools/fs'
import { secretLeakGuardrail } from '@anvia/extensions/guardrails'
import { toolOutputLimit } from '@anvia/extensions/middlewares'
import { usageHook } from '@anvia/extensions/hooks'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })

const agent = new Agent({
  id: 'workspace-reader',
  model: client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' }),
  instructions: 'Answer questions about the project using the files in the workspace.',
  tools: [filesystem({ rootDir: './workspace', readOnly: true })],
  guardrails: [secretLeakGuardrail()],
  middlewares: [toolOutputLimit({ maxChars: 8_000 })],
  lifecycle: [
    usageHook({
      onReport: (report) => {
        console.log(report.status, report.steps, report.toolCalls, report.usage.totalTokens)
      },
    }),
  ],
})

const response = await agent.generate({ prompt: 'What does the README say about setup?' })
if (response.type === 'response') console.log(response.output)
```

What each piece does:

- **`filesystem({ rootDir, readOnly: true })`** registers `read_file`, `list_files`, and `grep`,
  confined to `./workspace` after resolving symlinks. Without `readOnly`, it also adds `write_file`,
  `edit_file`, and `delete_file`; only `delete_file` requires approval by default.
- **`secretLeakGuardrail()`** checks the final answer against built-in credential patterns (API keys,
  tokens, JWTs, private keys) and blocks the response on a match.
- **`toolOutputLimit({ maxChars })`** truncates any tool result longer than 8,000 characters before
  the model sees it.
- **`usageHook({ onReport })`** reports status, steps, tool calls, failures, duration, and token usage
  once per run. `lifecycle` accepts an array, so you can add `costHook` or `auditHook` beside it.

The toolkit's built-in instructions are appended to the agent's instructions. Pass
`instructions: false` to the toolkit to omit them, or a string to replace them. See
[Toolkits](/sdk/tools/toolkits) for how toolkit options are applied.

## Next steps

- Pick more [toolkits](/packages/extensions/toolkits), or wrap one with `withToolRetry` or `withToolCache`.
- Add [guardrails, middlewares, and hooks](/packages/extensions/guardrails-middlewares-hooks).
- Read [Security](/packages/extensions/security) before enabling `shell`, write access, or network tools.
