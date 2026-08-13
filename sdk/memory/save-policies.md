# Save policies

A save policy controls when messages created during a run are appended to the memory store.

## Choose a policy

| Policy | Behavior | Use when |
| --- | --- | --- |
| `'message'` | Saves each completed user, assistant, and tool-result message. | Incremental durability matters most. |
| `'turn'` | Saves completed messages after each model-and-tool turn. | Product chat should preserve complete turns. |
| `'run'` | Saves only after a successful final response. | Partial runs must not enter future context. |

`'message'` is the default. Choose the policy explicitly so the intended failure behavior is visible in agent configuration.

```ts
const agent = new Agent({
  id: 'support',
  model: model,
  memory: { store: memoryStore, savePolicy: 'turn' },
})
```

## Failed runs

Messages already saved by `'message'` or `'turn'` may remain when a later step fails. With `'run'`, normal messages are written only after the run completes successfully.

A store may implement `recordError(...)` to retain failed-run diagnostics separately. Those records are operational data and should not be loaded as normal conversation context.

## Match the policy to side effects

Save policy controls transcript persistence, not tool execution. A failed run may already have called a tool, so side-effect tools should remain idempotent or independently auditable.
