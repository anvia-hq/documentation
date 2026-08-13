# Failures and limits

Bound every child and decide how the coordinator should handle partial or complete failure.

## Set child turn limits

Child agents should have smaller limits than the coordinator:

```ts
const research = researchAgent.asTool({
  name: 'research',
  description: 'Research one focused question and return sources.',
  maxTurns: 3,
})

const coordinator = new Agent({
  id: 'research-coordinator',
  model: model,
  maxTurns: 6,
  tools: [research],
})
```

A child that can call tools or other agents can otherwise consume a large amount of latency and model usage inside one parent tool call.

## Understand failure propagation

When a child agent fails, the parent sees a tool failure. Hooks, middleware, or application-owned tool error handling may map that failure into a safe result; otherwise handle it at the parent runner boundary.

```ts
try {
  return await coordinator
    .prompt(question)
    .send()
} catch (error) {
  await logger.error('Coordinated run failed', { error })
  throw error
}
```

Do not report a partial answer as complete unless the coordinator is explicitly instructed and tested to proceed without the failed specialist.

## Choose a partial-failure policy

| Specialist role | Typical policy |
| --- | --- |
| Optional background research | Continue and disclose missing evidence. |
| Required policy review | Stop or return for human review. |
| Duplicate source checker | Continue if another trusted source succeeded. |
| Side-effect executor | Fail closed and inspect whether the action completed. |

The application should decide which specialists are optional. Do not leave safety-critical fallback policy implicit in the coordinator prompt.

## Prevent runaway delegation

- Keep parent and child `maxTurns` explicit.
- Avoid cycles where agents expose each other as tools.
- Keep specialist tool sets narrow.
- Give each delegation one focused task.
- Prefer shallow parent-to-child structures.

Add another nesting level only when it creates a real policy or capability boundary.

## Protect side effects

A failed parent run does not undo a child tool that already completed. Any child with write tools still needs authorization, idempotency, audit, and a way to reconcile uncertain outcomes.

Trace parent and child work together so operators can tell whether failure happened before, during, or after a side effect.
