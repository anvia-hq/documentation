# Agent output

Use an agent `outputSchema` when tools, retrieval, memory, or multiple turns are needed before the final response should follow a structured shape.

## 1. Configure the final shape

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
  model,
  instructions: 'Use tools when account state is needed.',
  outputSchema: supportResultSchema,
  maxTurns: 4,
  tools: createSupportTools(scope),
})
```

Anvia converts the Zod schema to provider JSON Schema and includes it in the agent's model requests. The model must support both the agent capabilities used by the run and output schemas.

## 2. Read the response outcome

`outputSchema` makes the agent generic output type match the schema. A response outcome exposes the
validated value directly:

```ts
const response = await agent.generate({
    prompt: 'Resolve the customer billing question.'
})

if (response.type === 'interaction') {
  return handleInteraction(response)
}

if (response.type === 'blocked') {
  return handleBlocked(response)
}

console.log(response.output.needsHuman)
```

Anvia validates the provider output with the supplied schema before returning a response. Invalid
structured output rejects the run.

## 3. Validate streamed output at the end

Text deltas are incomplete JSON and must not be parsed as they arrive. Accumulate UI text if
needed, then use the validated `output` on the terminal `response` event:

```ts
for await (const event of agent.stream({
    prompt: input
})) {
  if (event.type === 'text_delta') {
    renderDelta(event.delta)
  }

  if (event.type === 'response') {
    await saveValidatedResult(event.output)
  }
}
```

Use [parsed completion](/sdk/structured-output/parsed-completion) when one direct request is enough. Agent output is valuable only when the run genuinely needs agent runtime features before producing the object.
