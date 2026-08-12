# Conversation memory

**Type:** Pattern

## Outcome

Keep conversation history by session so a later prompt can use facts from an earlier turn. Use this
for authenticated chats that need durable continuity across requests or processes.

## Prerequisites

- Node.js 22 or newer and pnpm
- `@anvia/core`, `@anvia/openai`, and `tsx`
- A server-side `OPENAI_API_KEY`

## Store boundary

This in-memory store demonstrates the contract; it is not durable across restarts:

```ts
import type { Message } from '@anvia/core/completion'
import type { MemoryAppendInput, MemoryContext, MemoryStore } from '@anvia/core/memory'

export class LocalMemoryStore implements MemoryStore {
  private readonly sessions = new Map<string, Message[]>()

  async load({ sessionId }: MemoryContext): Promise<Message[]> {
    return [...(this.sessions.get(sessionId) ?? [])]
  }

  async append(input: MemoryAppendInput): Promise<void> {
    const id = input.context.sessionId
    this.sessions.set(id, [...(this.sessions.get(id) ?? []), ...input.messages])
  }

  async clear({ sessionId }: MemoryContext): Promise<void> {
    this.sessions.delete(sessionId)
  }
}
```

Use the store from `memory-demo.ts`:

```ts
import { AgentBuilder } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { LocalMemoryStore } from './local-memory-store.js'

const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('Set OPENAI_API_KEY.')

const agent = new AgentBuilder(
  'assistant',
  new OpenAIClient({ apiKey }).completionModel('gpt-5'),
)
  .instructions('Use remembered context, but do not invent missing facts.')
  .memory(new LocalMemoryStore())
  .build()

const session = agent.session('chat_7d8f', { userId: 'user_42' })
await session.prompt('Remember that my project is named Anvia.').send()
console.log((await session.prompt('What is my project named?').send()).output)
```

## Run and expected behavior

```bash
pnpm tsx memory-demo.ts
```

The second run should answer “Anvia,” with wording determined by the model. A different session ID
has a separate history.

## Boundaries

A session ID is a lookup key, not authorization. Derive it from trusted application state, verify
the authenticated user and tenant on every store operation, and prevent cross-tenant reads. The
local implementation also lacks concurrency control, persistence, retention, compaction, and
encryption. Use an Anvia store adapter or a transactional custom store in production, establish
deletion and retention policies, and keep long histories within the model context budget.

## Source and extensions

See the runnable
[conversation memory cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/02-conversation-memory.ts)
and [session variant](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/01_basics/06-session-memory.ts).
Next, replace the map with a database adapter, add compaction, and test concurrent requests.

- [Configure memory](/sdk/memory/configure)
- [Sessions](/sdk/memory/sessions)
- [Custom stores](/sdk/memory/custom-stores)
