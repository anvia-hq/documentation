# Pipelines

Pipelines combine deterministic TypeScript, agents, extractors, and reusable operations into a typed workflow.

```text
Validate input -> run typed stages -> return final output
```

Use a pipeline when work needs several explicit stages, reusable composition, bounded batch execution, parallel branches, or an inspectable graph. A clear single function does not need to become a pipeline.

## 1. Create a pipeline

In v1, construct `Pipeline` directly and chain stages from it:

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const normalizeTicket = new Pipeline({
  id: 'normalize-ticket',
  inputSchema: z.object({
    subject: z.string().min(1),
    body: z.string().min(1),
  }),
}).step({
  id: 'normalize-fields',
  run: ({ input: ticket }) => ({
    subject: ticket.subject.trim(),
    body: ticket.body.trim().replace(/\s+/g, ' '),
  }),
});

const ticket = await normalizeTicket.run({
  input: {
    subject: ' Checkout failure ',
    body: ' Payment   authorization failed. ',
  },
});
console.log(ticket.output);
```

There is no `PipelineBuilder` or `.build()` phase in v1. Every fluent method returns a new immutable pipeline with its updated output type.

## 2. Put work in the right stage

Use `.step()` for normalization, authorization, database access, service calls, branching, side effects, and response shaping.

Use `.agent()` only where model reasoning adds value. Use `.extract()` when existing text must become [schema-validated data](/sdk/structured-output/extractors).

Keep deterministic product decisions in TypeScript rather than prompt instructions.

## 3. Continue through the section

- [Validate typed input](/sdk/pipelines/typed-input)
- [Add deterministic steps](/sdk/pipelines/steps)
- [Use agents and extractors](/sdk/pipelines/agents-and-extractors)
- [Compose reusable operations](/sdk/pipelines/composition)
- [Run parallel branches and batches](/sdk/pipelines/parallel-and-batch)
- [Observe runs and handle errors](/sdk/pipelines/runs-and-errors)
- [Operate pipelines in workers](/sdk/pipelines/production-workers)
