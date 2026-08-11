# Sessions

A session connects one product conversation to its durable message history.

## Continue a conversation

Use the same session ID and scope for related turns.

```ts
const session = agent.session('thread_123', {
  userId: user.id,
  metadata: { tenantId: user.tenantId },
})

const first = await session
  .prompt('Summarize my latest invoice.')
  .send()

const followUp = await session
  .prompt('When is it due?')
  .send()
```

A session ID should identify a product conversation—not a request, model call, or browser connection.

## Load stored messages

Use `messages()` when a product or internal surface needs the current transcript.

```ts
const messages = await agent
  .session('thread_123', {
    userId: user.id,
    metadata: { tenantId: user.tenantId },
  })
  .messages()
```

The result is core Anvia `Message[]`. A React client can convert it with `initialMessagesFromMemory(...)` before passing it to `useChat({ initialMessages })`.

Hydrated browser messages are display state. On the next request, send only the latest user message through `agent.session(...).prompt(...)`; the server loads the durable transcript again.

## Clear a conversation

```ts
await agent
  .session('thread_123', {
    userId: user.id,
    metadata: { tenantId: user.tenantId },
  })
  .clear()
```

Use `clear()` for user deletion, retention cleanup, or test setup. Apply the same authorization and tenant scope used for reads and writes.
