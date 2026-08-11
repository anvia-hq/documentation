# Get started

Install Core with one provider adapter. Core supplies contracts and orchestration; the provider package supplies runnable model objects.

```sh
pnpm add @anvia/core @anvia/openai zod
```

```ts
import { AgentBuilder, createTool } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const model = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
}).completionModel('gpt-5')

const currentTime = createTool({
  name: 'current_time',
  description: 'Return the current server time.',
  input: z.object({}),
  output: z.object({ iso: z.string() }),
  execute: async () => ({ iso: new Date().toISOString() }),
})

const agent = new AgentBuilder('assistant', model)
  .instructions('Answer briefly and use tools when they provide fresher data.')
  .tool(currentTime)
  .defaultMaxTurns(4)
  .build()

const response = await agent.prompt('What time is it?').send()
console.log(response.output)
```

Keep the API key and agent execution on the server. A browser should call an authenticated application route rather than construct the provider client itself.

## Pick the smallest runtime primitive

| Need | Start with |
| --- | --- |
| One model request | `createCompletion` |
| Schema-validated data | `createParsedCompletion` |
| Reusable instructions or automatic tools | `AgentBuilder` |
| Explicit typed stages | `PipelineBuilder` |
| Persistent conversation | `agent.session(...)` with a `MemoryStore` |

Core does not require Studio, React, or Lens. Add those packages only when the application needs their development, client, or observability surfaces.

Continue with [configuration](/packages/core/configuration), [runtime lifecycle](/packages/core/runtime-lifecycle), or the complete [API reference](/packages/core/api-reference).
