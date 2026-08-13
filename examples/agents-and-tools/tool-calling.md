# Tool calling

**Type:** Recipe

## Outcome

Let an agent call a typed function and use its result in a final answer. Choose this pattern when the
model needs live application data or a capability that should remain in trusted code.

## Prerequisites

- Node.js 22 or newer, pnpm, and a server-side `OPENAI_API_KEY`
- `pnpm add @anvia/core @anvia/openai zod`
- `pnpm add -D tsx typescript @types/node`

## Implementation

```ts
import { Agent } from '@anvia/core/agent'
import { createTool } from '@anvia/core/tool'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const add = createTool({
  name: 'add',
  description: 'Add two numbers.',
  input: z.object({ x: z.number(), y: z.number() }),
  output: z.number(),
  execute: ({ x, y }) => x + y,
})

const agent = new Agent({
  id: 'calculator',
  model: new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY }).completionModel('gpt-5'),
  instructions: 'Use the add tool for arithmetic, then explain the result briefly.',
  maxTurns: 2,
  tools: [add],
})

console.log((await agent.prompt('What is 12 + 30?').send()).output)
```

## Run and expected behavior

Save as `tool-call.ts`, run `pnpm tsx tool-call.ts`, and expect an answer containing `42`. The first
model turn can request `add`; Anvia validates its arguments, runs the handler, returns the validated
tool result, and gives the model another turn to answer.

## Boundaries

Zod validates shape, not identity, authorization, or business invariants. Enforce those inside the
handler using trusted request context. Keep side effects idempotent where possible, set a turn
limit, and never expose arbitrary network, filesystem, or database access as a broad tool.

For production, separate tool definitions from service implementations, add audit-safe hooks, map
tool failures to safe results, and test the complete call/result/final-answer loop for each model.

## Source and extensions

Run the
[tool-call cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/01-tool-call.ts).
Next, add [permissions](./tool-permissions), [approval](./tool-approval), or concurrent independent
tool calls.

- [Define tools](/sdk/tools/define)
- [Validation and execution](/sdk/tools/validation-and-execution)
