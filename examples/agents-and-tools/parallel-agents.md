# Parallel agents

**Type:** Pattern

## Outcome

Run independent specialist pipelines concurrently, then synthesize their outputs. Use deterministic
parallelism when every specialist must run and none depends on another specialist's result.

## Prerequisites

- Specialist agents with focused instructions
- `PipelineBuilder` from `@anvia/core/pipeline`
- A Zod schema for the shared input

## Parallel pipeline

```ts
import { PipelineBuilder } from '@anvia/core/pipeline'
import { z } from 'zod'

const supportNotes = new PipelineBuilder(z.string())
  .step((incident) => `Triage for support:\n${incident}`)
  .prompt(supportAgent)
  .build()

const engineeringNotes = new PipelineBuilder(z.string())
  .step((incident) => `Triage for engineering:\n${incident}`)
  .prompt(engineeringAgent)
  .build()

const brief = new PipelineBuilder(z.string())
  .parallel({ support: supportNotes, engineering: engineeringNotes })
  .step(({ support, engineering }) => [
    'Synthesize these notes into one incident brief.',
    `Support:\n${support}`,
    `Engineering:\n${engineering}`,
  ].join('\n\n'))
  .prompt(synthesizerAgent)
  .build()

console.log(await brief.run(incident))
```

The agent and `incident` definitions are separate application files; the complete linked cookbook
shows all four agents and safe fallback text.

## Run and expected behavior

Both branches receive the same validated string and can execute concurrently. The named result
object is passed to the merge step, then the synthesizer returns the final brief. This differs from
concurrent tool calls: the pipeline, not a model, decides that every branch runs.

## Boundaries

Parallel calls can multiply cost and rate pressure. One rejected branch may fail the composed run,
so choose explicit retry, timeout, and partial-result policies rather than silently omitting a
specialist. Do not pass data to a branch that is not authorized to see it.

In production, cap concurrency outside a single request, trace branch names, make retries safe,
record branch outputs for diagnosis, and use durable workers for long-running or high-volume jobs.

## Source and extensions

Run the
[parallel-specialists cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/07_multi_agent/02-parallel-specialists.ts).
Next, add a third branch, per-branch schemas, and deliberate failure recovery.

- [Parallel pipelines](/sdk/advanced/parallel-and-batch/parallel)
- [Parallel failures](/sdk/advanced/parallel-and-batch/failures)
