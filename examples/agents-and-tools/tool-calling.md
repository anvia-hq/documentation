# Tool calling

Tools let a model request live application data or a capability that remains in trusted code. Anvia validates the call, runs the handler, and gives the result back to the model.

```ts
import { Agent, createTool } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const add = createTool({
  name: 'add',
  description: 'Add two numbers.',
  inputSchema: z.object({
    x: z.number(),
    y: z.number(),
  }),
  outputSchema: z.number(),
  execute: ({ x, y }) => x + y,
})

const agent = new Agent({
  id: 'calculator',
  model: new OpenAIClient({
      apiKey: process.env.OPENAI_API_KEY!,
  }).completionModel({
      modelId: 'gpt-5.5',
      api: "responses"
  }),
  instructions: 'Use add for arithmetic, then explain the result briefly.',
  maxTurns: 2,
  tools: [add],
})

const result = await agent.generate({
    prompt: 'What is 12 + 30? Use the add tool.'
})

if (result.status === 'approval_required') {
  throw new Error(`Approval required for ${result.approval.toolName}`)
}
if (result.status === 'blocked') throw new Error(`Agent blocked at ${result.stage}`)

console.log(result.output)
```

The first model turn requests `add`. Anvia parses its arguments with `inputSchema`, executes the function, validates the returned number with `outputSchema`, and allows a second model turn to produce the final answer.

Zod validates shape, not identity, authorization, or business rules. Enforce those inside the handler using trusted request scope. Keep side effects narrow and idempotent where practical, and always set a deliberate turn limit.

Continue with [tool permissions](./tool-permissions), [approval](./tool-approval), or [middleware](./tool-middleware).
