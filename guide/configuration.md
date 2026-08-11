# Configuration

Anvia configuration is application code. Create concrete dependencies at the edge of your application, then pass provider-neutral interfaces into the runtime.

## Provider model

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = client.completionModel('gpt-5')
```

Keep provider credentials on the server. To change vendors, create a model from another provider package and pass it through the same core APIs.

## Agent defaults

```ts
import { AgentBuilder } from '@anvia/core'

const agent = new AgentBuilder('support', model)
  .name('Support')
  .description('Answers support questions.')
  .instructions('Answer clearly and ask for missing details.')
  .defaultMaxTurns(4)
  .build()
```

Turn limits bound model/tool loops. A tool-assisted answer usually needs one turn to request the tool and another to use its result.

## Request overrides

Configure exceptional requests at the prompt level instead of creating a second agent:

```ts
const response = await agent
  .prompt('Summarize this ticket in one sentence.')
  .maxTurns(2)
  .send()
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
import { createPrismaMemoryStore } from '@anvia/memory-prisma'
import { prisma } from './db'

const memory = createPrismaMemoryStore(prisma, {
  scope: { metadataKeys: ['tenantId'] },
})

const agent = new AgentBuilder('assistant', model)
  .memory(memory, { savePolicy: 'turn' })
  .build()
```

`savePolicy: 'turn'` stores complete model and tool turns together. Use stable product identifiers in storage scope and enforce authorization before calling the agent.

## Stream format

`@anvia/server` emits JSONL by default. Use SSE only when the client requires `text/event-stream` compatibility:

```ts
return createEventStream(agent.prompt(messages).stream(), { format: 'sse' })
```

## Logging payloads

The logger observer omits final outputs, full model requests, model responses, and tool results by default. Opt into sensitive payloads only when your data policy permits them.
