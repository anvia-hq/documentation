# Get started

Install Core with one provider adapter. Core supplies contracts and orchestration; the provider package supplies runnable model objects.

```sh
pnpm add @anvia/core @anvia/openai zod
```

```ts
import { Agent, createTool } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const model = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY!,
}).completionModel({
    modelId: 'gpt-5.6-sol',
    api: "responses"
})

const currentTime = createTool({
  name: 'current_time',
  description: 'Return the current server time.',
  inputSchema: z.object({}),
  outputSchema: z.object({ iso: z.string() }),
  execute: async () => ({ iso: new Date().toISOString() }),
})

const agent = new Agent({
  id: 'assistant',
  model: model,
  instructions: 'Answer briefly and use tools when they provide fresher data.',
  maxTurns: 4,
  tools: [currentTime],
})

const response = await agent.generate({
    prompt: 'What time is it?'
})
if (response.status === 'completed') console.log(response.output)
```

Keep the API key and agent execution on the server. A browser should call an authenticated application route rather than construct the provider client itself.

## Pick the smallest runtime primitive

| Need | Start with |
| --- | --- |
| One model request | `generateCompletion` |
| Schema-validated data | `generateCompletion` |
| Reusable instructions or automatic tools | `Agent` |
| Explicit typed stages | `Pipeline` |
| Persistent conversation | `agent.generate({ prompt, session })` with a `MemoryStore` |

Core does not require Studio, React, or Lens. Add those packages only when the application needs their development, client, or observability surfaces.

Continue with [configuration](/packages/core/configuration), [runtime lifecycle](/packages/core/runtime-lifecycle), or the complete [API reference](/packages/core/api-reference).
