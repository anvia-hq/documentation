# Configure memory

Configure memory in three steps: create a store, attach it to the agent, and construct sessions only after the application authorizes the requested conversation scope.

## 1. Install one adapter

During the v1 release-candidate period, keep the memory adapter and core runtime on the `rc` channel:

```bash
pnpm add @anvia/core@rc @anvia/memory-prisma@rc @prisma/client
```

Use the adapter that matches the database layer the application already operates. See [Store adapters](/sdk/memory/store-adapters) for Drizzle, direct Postgres, and SQLite alternatives.

## 2. Create the store

```ts
import { PrismaMemoryStore } from '@anvia/memory-prisma'
import { prisma } from './db'

const memoryStore = new PrismaMemoryStore({
  client: prisma,
  scopeKey: {
    metadataKeys: ['tenantId'],
  },
})
```

Official adapters scope a conversation by `sessionId` and `userId` by default. Adding `metadataKeys: ['tenantId']` also includes `metadata.tenantId` in the storage key.

Use stable product identifiers for every scope value. Changing a user ID or selected metadata value creates a different storage scope even when the session ID is unchanged.

## 3. Attach the store to an agent

```ts
import { Agent } from '@anvia/core'

export const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Use the conversation history when it is relevant.',
  memory: {
    store: memoryStore,
    savePolicy: 'turn',
  },
})
```

`savePolicy` controls when messages are appended. It defaults to `'message'`; choosing `'turn'` explicitly is a practical starting point when a product wants complete model-and-tool turns persisted together.

Compaction, when needed, is configured inside the same `memory` object.

## 4. Authorize and create a session

```ts
export async function runSupportTurn(request: SupportRequest) {
    const conversation = await loadAuthorizedConversation({
        actor: request.user,
        conversationId: request.conversationId,
    });
    const session = { sessionId: conversation.id, userId: request.user.id, metadata: { tenantId: request.user.tenantId } };
    return supportAgent.generate({
        prompt: request.message,
        trace: {
            name: 'support-session-turn',
            userId: request.user.id,
            sessionId: conversation.id,
        },
        session: session
    });
}
```

Storage scope prevents accidental row sharing; it does not prove that the caller owns the conversation. Authorize before passing a scope to an agent run or calling the store's `load()` or `clear()` methods.

## 5. Decide how failures are stored

Official adapters validate message shapes and record failed-run diagnostics by default. Set `errorPolicy: 'ignore'` on the adapter only when another protected system owns failure diagnostics and the memory database should not retain them.

Failed-run records are not loaded as conversation history. They may still contain sensitive prompts and tool data, so apply a separate retention policy.

Continue with [Sessions](/sdk/memory/sessions).
