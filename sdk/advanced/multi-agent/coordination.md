# Coordination

The coordinator owns delegation, conflict resolution, the final response, and the product-facing run boundary.

## 1. Give every agent one job

The coordinator frames tasks, chooses specialists, resolves conflicts, and writes the final answer.

Specialists return focused evidence, analysis, constraints, or recommendations. They should not independently send competing user-facing replies or persist final product records.

## 2. Make routing explicit

```ts
const coordinator = new Agent({
  id: 'incident-coordinator',
  model: coordinatorModel,
  instructions: [
    'Classify the incident.',
    'Use log_analysis for supplied logs.',
    'Use policy_review for customer-facing statements.',
    'Preserve disagreements and uncertainty.',
    'Write one final answer after the tools return.',
  ].join('\n'),
  maxTurns: 6,
  tools: [
    logAgent.asTool({
      name: 'log_analysis',
      description: 'Analyze supplied logs and return likely causes.',
      maxTurns: 3,
    }),
    policyAgent.asTool({
      name: 'policy_review',
      description: 'Review a proposed response for policy risk.',
      maxTurns: 2,
    }),
  ],
})
```

Distinct tool names and descriptions form the routing surface. The instructions define how specialist results contribute to the final response.

## 3. Keep product ownership in the parent

```ts
const response = await coordinator.generate({
    prompt: input.question,
    trace: {
        name: 'incident-coordination',
        userId: input.user.id,
        metadata: {
            tenantId: input.user.tenantId,
            incidentId: input.incidentId,
        },
    }
})

if (response.status === 'completed') {
  await incidents.saveDraft({
    incidentId: input.incidentId,
    output: response.output,
  })
}
```

Persist one product result from the coordinator boundary. Keep child output as supporting runtime evidence.

## 4. Preserve disagreement

Tell the coordinator to state uncertainty and summarize conflicting specialist results. Silently choosing one answer can make the final response look more certain than its evidence.

## 5. Prefer deterministic orchestration when possible

If the application already knows which steps must run and in what order, use a [Pipeline](/sdk/pipelines) or ordinary TypeScript. Use an agent coordinator only when model judgment is genuinely needed to choose or sequence specialists.

Next, bound [failures and limits](/sdk/advanced/multi-agent/failures).
