# Configuration

Anvia configuration is application code. Create concrete dependencies at the edge of your application, then pass provider-neutral interfaces into the runtime.

## Provider model

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const model = client.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})
```

Keep provider credentials on the server. To change vendors, create a model from another provider package and pass it through the same core APIs.

## Agent defaults

```ts
import { Agent } from '@anvia/core'

const agent = new Agent({
  id: 'support',
  model: model,
  name: 'Support',
  description: 'Answers support questions.',
  instructions: 'Answer clearly and ask for missing details.',
  maxTurns: 4,
})
```

Turn limits bound model/tool loops. A tool-assisted answer usually needs one turn to request the tool and another to use its result.

## Request overrides

Configure exceptional runs through `generate(...)` options instead of creating a second agent:

```ts
const response = await agent.generate({
    prompt: 'Summarize this ticket in one sentence.',
    maxTurns: 2
})
```

## Memory

For durable product chat, the first-class path is Prisma:

```bash
pnpm add @anvia/memory-prisma @prisma/client
npx @anvia/memory-prisma init --write
npx prisma validate
npx prisma migrate dev --name add_anvia_memory
```

```ts
import { PrismaMemoryStore } from '@anvia/memory-prisma'
import { prisma } from './db'

const memory = new PrismaMemoryStore({
  client: prisma,
  scopeKey: { metadataKeys: ['tenantId'] },
})

const agent = new Agent({
  id: 'assistant',
  model: model,
  memory: { store: memory, savePolicy: 'turn' },
})
```

`savePolicy: 'turn'` stores complete model and tool turns together. Use stable product identifiers in storage scope and enforce authorization before calling the agent.

## Stream format

`@anvia/server` emits JSONL by default. Use SSE only when the client requires `text/event-stream` compatibility:

```ts
const events = agent.stream({
    messages
})

return createClientStreamResponse({
  events: agentToClientStream({ events }),
  format: 'sse',
})
```

## Logging payloads

The logger observer omits final outputs, full model requests, model responses, and tool results by default. Opt into sensitive payloads only when your data policy permits them.
