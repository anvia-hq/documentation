# Agent output

Use the `outputSchema` option when an agent may use tools or runtime context before returning a structured final answer.

## Configure the final shape

```ts
import { Agent } from '@anvia/core'
import { z } from 'zod'

const supportResultSchema = z.object({
  answer: z.string(),
  actionsTaken: z.array(z.string()),
  needsHuman: z.boolean(),
})

const agent = new Agent({
  id: 'support',
  model: model,
  instructions: 'Use tools when account state is needed. Return the requested object.',
  outputSchema: supportResultSchema,
  maxTurns: 4,
  tools: [...createSupportTools(scope)],
})
```

The schema is sent with the agent's model requests so the final response follows that shape.

## Parse the final response

An agent response still exposes its final output as text. Parse it locally before product code reads its fields.

```ts
const response = await agent
  .prompt('Resolve the customer billing question.')
  .send()

const result = supportResultSchema.parse(
  JSON.parse(response.output),
)

console.log(result.needsHuman)
```

## Check model support

The selected model path must support output schemas. If `model.capabilities.outputSchema` is false, use a compatible model or an extractor-style tool submission pattern instead of relying on prompt text to produce valid JSON.

Use parsed completion for one direct call. Agent output is useful only when the runtime capabilities before the final answer are actually needed.
