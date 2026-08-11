# Instructions

Instructions should define the moment that deserves a checkpoint and the small decision artifact the model should produce.

## Write a bounded instruction

```ts
const agent = new AgentBuilder('incident-review', model)
  .instructions([
    'Gather evidence with the available read-only tools.',
    'Use think once you have evidence from more than one source.',
    'In the checkpoint, state the leading explanation, conflicting evidence, and the next required action.',
    'Do not place credentials, tokens, or raw customer data in the checkpoint.',
  ].join('\n'))
  .tools([createThinkTool(), ...incidentTools])
  .build()
```

This tells the model:

- **when** to call the tool
- **what** the checkpoint should contain
- **what** must remain outside it

## Match the workflow

For research:

```text
Use think after each round of research only when you must decide
whether the evidence is sufficient or another source is needed.
Record the conclusion, uncertainty, and next source in a few sentences.
```

For support diagnosis:

```text
Use think before the final answer when account and ticket evidence
must be reconciled. Record the supported conclusion and any unresolved fact.
```

For an action requiring approval:

```text
Use think to summarize the evidence and proposed action before requesting
approval. The checkpoint does not grant approval and must not execute the action.
```

## Avoid unbounded prompts

Avoid instructions such as:

```text
Always think step by step and record everything.
```

They encourage long transcripts, unnecessary calls, and sensitive detail. Ask for a concise operational artifact instead: a decision, evidence summary, uncertainty, or next action.

## Keep enforcement outside instructions

Instructions guide model behavior but remain probabilistic. If the agent must pause before a sensitive tool, enforce that boundary with tool authorization, approval hooks, or a protected application service. Think can prepare the decision; code must enforce it.
