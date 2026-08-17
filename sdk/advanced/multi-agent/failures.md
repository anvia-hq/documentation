# Failures and limits

Bound every child and define how the coordinator should use failed or missing specialist work.

## 1. Set child limits

```ts
const research = researchAgent.asTool({
  name: 'research',
  description: 'Research one focused question and return sources.',
  maxTurns: 3,
})

const coordinator = new Agent({
  id: 'research-coordinator',
  model,
  maxTurns: 6,
  tools: [research],
})
```

A child can contain its own tool loop, so use a smaller limit than the coordinator and give each delegation one focused task.

## 2. Understand child failure propagation

If a child agent throws, its generated tool call is marked failed. By default, the error text becomes a tool result and the coordinator may continue to another model turn.

This does not guarantee a safe partial answer. Tell the coordinator how to react, and use lifecycle or observer data to distinguish successful and failed specialist tools.

```ts
const coordinator = new Agent({
  id: 'policy-coordinator',
  model,
  instructions: [
    'A successful policy_review is required.',
    'If that tool fails, do not present the draft as approved.',
    'Return the request for human review.',
  ].join('\n'),
  tools: [policyReview],
})
```

The application should own safety-critical fallback policy rather than relying only on the coordinator's interpretation of an error string.

## 3. Prevent runaway delegation

- Set explicit parent and child turn limits.
- Avoid cycles where agents expose each other as tools.
- Keep child tool sets narrow.
- Prefer one coordinator-to-specialist level.
- Account for combined model usage and latency.

Add another nesting level only when it creates a real capability or policy boundary.

## 4. Handle approval deliberately

An `asTool()` child cannot suspend for approval. A child approval request becomes an agent-tool failure. Put resumable approval at the parent or application boundary instead.

## 5. Protect side effects

A failed parent run does not undo a child tool that already completed. Write tools need authorization, idempotency, audit, and reconciliation for uncertain outcomes.

Trace parent and child work together so operators can identify whether a failure happened before, during, or after a side effect.

Next, decide [when not to use multiple agents](/sdk/advanced/multi-agent/when-not-to-use).
