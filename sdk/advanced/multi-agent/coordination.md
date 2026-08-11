# Coordination

The coordinator owns delegation, conflict resolution, the final response, and the product-facing run boundary.

## Give every agent one job

| Agent | Responsibility |
| --- | --- |
| Coordinator | Frame tasks, call specialists, resolve conflicts, and write the final answer. |
| Policy specialist | Return applicable constraints and risks. |
| Technical specialist | Return implementation facts or runbook evidence. |
| Research specialist | Return focused findings and sources. |

Specialists should return evidence, summaries, or recommendations—not independent final answers to the user.

## Make delegation explicit

```ts
const coordinatorInstructions = [
  'Classify the incident.',
  'Use log_analysis for logs.',
  'Use policy_review for customer-facing statements.',
  'Summarize disagreements and uncertainty.',
  'Write one final answer yourself after the tools return.',
].join('\n')

const coordinator = new AgentBuilder(
  'incident-coordinator',
  coordinatorModel,
)
  .instructions(coordinatorInstructions)
  .tools([
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
  ])
  .defaultMaxTurns(6)
  .build()
```

Tool names and descriptions define the routing surface. Keep them distinct enough that the coordinator can choose the correct specialist.

## Keep product ownership in the parent

Run tracing, final persistence, and product response mapping around the coordinator:

```ts
const response = await coordinator
  .prompt(input.question)
  .withTrace({
    name: 'incident-coordination',
    userId: input.user.id,
    metadata: {
      tenantId: input.user.tenantId,
      incidentId: input.incidentId,
    },
  })
  .send()

await incidents.saveDraft({
  incidentId: input.incidentId,
  output: response.output,
  traceId: response.trace?.traceId,
})
```

Do not let child agents independently send replies or persist competing final records.

## Handle disagreement visibly

Tell the coordinator to retain uncertainty and summarize conflicting specialist findings. A coordinator that silently chooses one result can make a multi-agent answer look more certain than its evidence.

## Use deterministic orchestration when possible

If the application already knows which steps must run and in what order, use a [Pipeline](/sdk/pipelines) or direct application code. Use an agent coordinator only when model judgment is genuinely needed to select or sequence specialists.
