# Agent as a tool

`agent.asTool()` creates a normal Anvia tool whose input is a focused prompt and whose output is the child agent's final text.

## 1. Build a narrow specialist

```ts
const policyAgent = new Agent({
  id: 'policy-review',
  name: 'Policy reviewer',
  model: policyModel,
  instructions: [
    'Review the supplied draft for policy risk.',
    'Return findings and recommended changes.',
    'Do not write the final customer response.',
  ].join('\n'),
  maxTurns: 2,
})
```

Give the child only the tools and context required for its role. It may use a different model from the coordinator.

## 2. Expose it with a precise description

```ts
const policyReview = policyAgent.asTool({
  name: 'policy_review',
  description: 'Review a draft customer response for policy risk.',
  maxTurns: 2,
  stream: true,
})
```

`name` is the stable tool name. `description` tells the coordinator when to delegate. `maxTurns` overrides the child run limit for this tool call. `stream: true` forwards child runtime events through a streamed parent run.

Without `stream: true`, the parent still receives the final child output as its tool result.

## 3. Add it to a coordinator

```ts
const coordinator = new Agent({
  id: 'support',
  model: coordinatorModel,
  instructions: [
    'Use policy_review before sending a high-risk answer.',
    'Resolve the findings and write one final response yourself.',
  ].join('\n'),
  maxTurns: 6,
  tools: [policyReview],
})
```

Keep specialist names and descriptions distinct. Overlapping tools make model routing ambiguous.

## 4. Pass a self-contained task

`asTool()` calls the child with a stateless prompt. It does not inherit the parent transcript, memory session, user ID, tenant metadata, or retrieval context.

Tell the coordinator to include only the facts and draft the specialist needs. Use the explicit session wrapper in [Memory boundaries](/sdk/advanced/multi-agent/memory) only when the child truly needs durable continuity.

## 5. Avoid approval inside an agent tool

An agent used through `asTool()` cannot suspend for its own tool approval. If the child reaches `approval_required`, Anvia cancels that child continuation and reports an agent-tool error.

Run approval-capable work directly at an application boundary, or expose the side effect as a protected parent tool whose approval the product can resume.

Next, consume [child events](/sdk/advanced/multi-agent/child-events).
