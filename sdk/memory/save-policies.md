# Save policies

A save policy controls when messages created during an agent run are appended to the memory store. It changes failure durability, not the model-and-tool behavior of the run.

## 1. Save each completed message batch

`'message'` is the default:

```ts
const agent = new Agent({
  id: 'support',
  model,
  memory: {
    store: memoryStore,
    savePolicy: 'message',
  },
})
```

The accepted user input is appended before the model loop. Final assistant output is appended when it completes. An assistant tool call and its tool-result message are appended together after tool execution.

Choose this policy when the greatest amount of completed progress should survive a later failure.

## 2. Save complete model-and-tool turns

```ts
const agent = new Agent({
  id: 'support',
  model,
  memory: {
    store: memoryStore,
    savePolicy: 'turn',
  },
})
```

`'turn'` buffers the active prompt, assistant message, and tool results until that model-and-tool turn completes. A multi-turn agent can therefore preserve earlier completed turns even if a later turn fails.

Choose this policy when the stored transcript should not contain a half-finished turn.

## 3. Save only a completed run

```ts
const agent = new Agent({
  id: 'support',
  model,
  memory: {
    store: memoryStore,
    savePolicy: 'run',
  },
})
```

`'run'` appends all new runtime messages only after the agent produces a successful final result. A failed or cancelled run contributes no normal conversation messages.

Choose this policy when future model context must contain only fully completed runs.

## 4. Understand failure records

For any policy, the runtime calls the store's optional `recordError()` after a run failure. Official adapters store those diagnostics separately by default; they do not load them into normal message history.

Messages already committed by `'message'` or `'turn'` remain after a later failure. With `'run'`, only the separate error record can describe the failed work.

## 5. Separate persistence from side effects

Save policy does not roll back tools. A failed run may already have sent an email, changed a plan, or written to another service even when no memory messages were saved.

Make side-effect tools idempotent, require approval where appropriate, and keep their own domain audit records. Choose memory policy based on the transcript needed by the next model turn, not as a substitute for transaction design.

Continue with [Compaction](/sdk/memory/compaction).
