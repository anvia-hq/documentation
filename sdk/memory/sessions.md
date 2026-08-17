# Sessions

A `MemoryScope` connects one product conversation to its stored message history. Pass the same session ID, optional user ID, and optional JSON metadata to every agent run that belongs to the conversation.

## 1. Create one authorized session

```ts
const session = { sessionId: 'thread_123', userId: user.id, metadata: { tenantId: user.tenantId } }
```

The session ID must be a non-empty string. Use a product conversation identifier, not a request ID, model call ID, browser connection, or temporary trace ID.

Reuse the same scope values for every operation that should address the same stored conversation.

## 2. Continue the conversation

```ts
const first = await supportAgent.generate({
    prompt: 'Summarize my latest invoice.',
    session,
});
if (first.status !== 'completed') {
    throw new Error(`Approval required for ${first.approval.toolName}`);
}
const followUp = await supportAgent.generate({
    prompt: 'When is it due?',
    session,
});
if (followUp.status === 'completed') {
    console.log(followUp.output);
}
```

Before each run, Anvia loads the stored messages and uses them as history. New runtime messages are appended according to the configured [save policy](/sdk/memory/save-policies).

If a tool requires approval, resume the exact pending result through the parent agent:

```ts
if (first.status === 'approval_required') {
  const resumed = await supportAgent.resume(first, {
    approved: true,
    reason: 'Approved by the account owner.',
  })
}
```

The suspended continuation retains its memory context.

## 3. Stream a session run

```ts
for await (const event of supportAgent.stream({
    prompt: 'Draft a short invoice explanation.',
    session,
})) {
    if (event.type === 'text_delta') {
        process.stdout.write(event.delta);
    }
    if (event.type === 'final') {
        console.log(event.result.runId, event.result.usage);
    }
}
```

Scoped streams use the same history and save policy as generated responses. Closing an active stream cancels the run and triggers normal failure cleanup.

## 4. Inspect stored state

```ts
const messages = await memoryStore.load({ scope: session })
```

`load()` returns the provider-neutral `Message[]` currently stored for the scope. A completed agent result exposes the latest run's optional `contextUsage` directly.

For React chat hydration, convert server-loaded memory with `initialMessagesFromMemory()` from `@anvia/react`. On the next request, send only the new user input through the server session; do not trust a browser transcript as the durable source of truth.

## 5. Clear a conversation

```ts
await memoryStore.clear({ scope: session })
```

Use the store's `clear()` method for an authorized deletion request, retention cleanup, or isolated test setup. The adapter deletes the conversation addressed by the full storage scope.

Continue with [Save policies](/sdk/memory/save-policies).
