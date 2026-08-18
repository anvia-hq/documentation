# Conversation memory

An agent session loads and saves message history under a stable conversation ID. This recipe uses an in-memory store to demonstrate the contract; the data disappears when the process restarts.

## 1. Implement the store

```ts
// local-memory-store.ts
import type { Message } from '@anvia/core/completion'
import type {
  MemoryAppendOptions,
  MemoryScope,
  MemoryStore,
} from '@anvia/core/memory'

export class LocalMemoryStore implements MemoryStore {
  private readonly sessions = new Map<string, Message[]>()

  async load({ scope }: { scope: MemoryScope }): Promise<Message[]> {
    return [...(this.sessions.get(scope.sessionId) ?? [])]
  }

  async append(input: MemoryAppendOptions): Promise<void> {
    const id = input.scope.sessionId
    const current = this.sessions.get(id) ?? []
    this.sessions.set(id, [...current, ...input.messages])
  }

  async clear({ scope }: { scope: MemoryScope }): Promise<void> {
    this.sessions.delete(scope.sessionId)
  }
}
```

## 2. Continue one session

```ts
// memory-demo.ts
import { Agent } from '@anvia/core';
import { OpenAIClient } from '@anvia/openai';
import { LocalMemoryStore } from './local-memory-store.js';
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey)
    throw new Error('Set OPENAI_API_KEY.');
const agent = new Agent({
    id: 'assistant',
    model: new OpenAIClient({ apiKey }).completionModel({
        modelId: 'gpt-5.6-sol',
        api: "responses"
    }),
    instructions: 'Use remembered context. Do not invent missing facts.',
    memory: { store: new LocalMemoryStore() },
});
const session = { sessionId: 'chat_7d8f', userId: 'user_42', metadata: { tenantId: 'tenant_9' } };
await agent.generate({
    prompt: 'Remember that my project is named Anvia.',
    session,
});
const result = await agent.generate({
    prompt: 'What is my project named?',
    session,
});
if (result.status === 'suspended') {
    throw new Error(`Agent suspended for ${result.interaction.type}`);
}
if (result.status === 'blocked') throw new Error(`Agent blocked at ${result.stage}`);
console.log(result.output);
```

The second run loads the first run's messages before calling the model. Another session ID addresses separate history.

## Protect session scope

A session ID is a lookup key, not authorization. Derive the session, user, and tenant identifiers from trusted application state and enforce the complete scope in every store operation. Never accept a browser-supplied conversation ID as sufficient proof of access.

The local store has no durability, concurrency control, retention, compaction, or encryption. Use a database adapter or transactional custom store in production, establish deletion policy, and keep long histories within the model context budget.

Continue with [memory sessions](/sdk/memory/sessions), [save policies](/sdk/memory/save-policies), and [custom stores](/sdk/memory/custom-stores).
