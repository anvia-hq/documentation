# Think tool instructions

Instructions should define the moment that deserves a checkpoint and the small operational artifact the model should record.

## 1. Write a bounded instruction

```ts
const agent = new Agent({
  id: 'incident-review',
  model,
  instructions: [
    'Gather evidence with the available read-only tools.',
    'Use think once you have evidence from more than one source.',
    'State the leading explanation, conflicting evidence, and next required action.',
    'Keep the checkpoint to three sentences.',
    'Do not include credentials, tokens, or raw customer data.',
  ].join('\n'),
  tools: [
    createThinkTool(),
    ...incidentTools,
  ],
})
```

This establishes when to call the tool, what useful decision state to record, how much text to produce, and what must remain outside it.

## 2. Match the workflow

For research:

```text
Use think after a research round only when you must decide whether
the evidence is sufficient. Record the conclusion, uncertainty,
and next source in no more than three sentences.
```

For support diagnosis:

```text
Use think before the final answer when account and ticket evidence
must be reconciled. Record the supported conclusion and unresolved fact.
```

For an action requiring approval:

```text
Use think to summarize the evidence and proposed action before the
approval step. The checkpoint neither grants approval nor executes the action.
```

## 3. Avoid unbounded reasoning requests

Avoid instructions such as:

```text
Always think step by step and record everything.
```

They encourage long transcripts, unnecessary calls, and sensitive detail. Ask for a concise decision, evidence summary, uncertainty, or next action instead of hidden or exhaustive reasoning.

## 4. Keep mandatory policy outside instructions

Instructions remain probabilistic. If an agent must pause before a sensitive tool, use `requiresApproval` and enforce authorization in the tool or protected application service.

Think may prepare the decision; code must enforce it.

Next, review [privacy and visibility](/sdk/advanced/think-tool/privacy).
