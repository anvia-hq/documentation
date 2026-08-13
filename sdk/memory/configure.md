# Configure memory

Create a durable store, attach it to the agent, and choose when completed messages are saved.

## Attach a store

```ts
import { Agent } from '@anvia/core'
import { createPrismaMemoryStore } from '@anvia/memory-prisma'
import { prisma } from './db'

const memory = createPrismaMemoryStore(prisma, {
  scope: {
    metadataKeys: ['tenantId'],
  },
})

export const agent = new Agent({
  id: 'support',
  model: model,
  instructions: 'Use the conversation history when it is relevant.',
  memory: { store: memory, savePolicy: 'turn' },
})
```

The store persists full Anvia `Message` values. `savePolicy: 'turn'` saves complete model-and-tool turns together and is a practical default for product chat.

## Run a durable conversation

```ts
const session = agent.session('thread_123', {
  userId: 'user_456',
  metadata: { tenantId: 'tenant_789' },
})

await session
  .prompt('Remember that my project is named Anvia.')
  .send()

const response = await session
  .prompt('What is my project named?')
  .send()

console.log(response.output)
```

Before each run, Anvia loads earlier messages for the session. It appends new messages according to the configured [save policy](/sdk/memory/save-policies).

## Keep storage scope stable

The default Prisma scope includes `sessionId` and `userId`. Selecting `tenantId` adds `metadata.tenantId` to that database key.

Use stable product identifiers for every scope value. Storage scope prevents accidental row sharing, but the route must still verify that the authenticated user may access the conversation.
