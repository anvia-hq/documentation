# When to use completions

Choose a direct completion when one provider call is the complete workflow and application code already owns the input, output, persistence, and control flow.

## Good fits

Direct completions work well for focused operations:

- summarize one document or database record;
- rewrite, translate, or classify content;
- draft a title, description, or short reply;
- verify provider credentials and model behavior;
- add one model-assisted step to an existing service; or
- power a small internal utility without conversation state.

```ts
import { generateCompletion } from '@anvia/core'

const summary = await generateCompletion({
    prompt: ticket.body,
    model,
    instructions: 'Summarize the customer problem in one sentence.',
    maxTokens: 100
})

await tickets.update(ticket.id, { summary: summary.text })
```

The application remains easy to reason about because it performs one explicit call and owns the next action.

## Use parsed completion for typed data

Choose `generateCompletion()` when one call is still enough but downstream code needs schema-validated data:

```ts
import { generateCompletion } from '@anvia/core'
import { z } from 'zod'

const classification = await generateCompletion({
    prompt: ticket.body,
    model,
    outputSchema: z.object({
        queue: z.enum(['billing', 'technical', 'account']),
        priority: z.enum(['low', 'normal', 'high']),
    })
})

await tickets.route(ticket.id, classification.output)
```

Use an [extractor](/sdk/structured-output/extractors) when typed extraction is a reusable component with its own stable model and schema configuration.

## Use an agent for orchestration

Move to an [agent](/sdk/agents) when the runtime should own reusable behavior or coordinate more than one provider call. An agent is the better boundary when a task needs:

- local tools that Anvia should execute;
- approval before a sensitive tool runs;
- multiple model and tool turns;
- memory-backed conversation sessions;
- stable or per-run context;
- middleware, guardrails, or lifecycle observers; or
- one reusable configuration shared by many runs.

```ts
import { Agent } from '@anvia/core'

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Resolve support requests using approved tools.',
  tools: [lookupAccount, createSupportCase],
  maxTurns: 6,
})

const response = await supportAgent.generate({
    prompt: ticket.body
})
```

A completion can return a tool call, but it does not execute that call or send the result back to the model. That is the clearest signal that the workflow has crossed into agent territory.

## Use a pipeline for explicit stages

Choose a [pipeline](/sdk/pipelines) when several deterministic and model-driven steps must run in a defined order. Pipelines make branching, retries, typed handoffs, and stage-level observation explicit instead of asking one model call to perform the entire workflow.

For example, an ingestion workflow might normalize input, extract structured fields, check business rules, and then save the result. A pipeline is a better fit than one large prompt because each boundary remains testable.

## Keep the narrow boundary when it is enough

A direct completion intentionally does not:

- execute local tools;
- load or save memory;
- retrieve dynamic application context automatically;
- repeat model turns; or
- persist runtime events.

Those limits are useful when the operation really is one call. Start with the smallest runtime shape that matches the workflow, then move to an agent, extractor, or pipeline only when the application needs that additional behavior.
