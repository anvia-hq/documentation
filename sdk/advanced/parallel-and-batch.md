# Parallel and batch execution

Parallel and batch execution reduce waiting time when work is genuinely independent.

```text
Parallel branches                    Batch

one ticket                           ticket A --\
  |- classify                        ticket B ---- same pipeline
  |- detect risk                     ticket C --/
  `- estimate impact
       |                                  |
one keyed result                     ordered results
```

Use `.parallel()` to fan one current value into named pipelines. Use `.runBatch()` to run one pipeline over many inputs with bounded concurrency. Use an application-owned job system when work must survive process restarts.

## 1. Run independent branches

```ts
import { Pipeline } from '@anvia/core/pipeline';
import { z } from 'zod';
const triage = new Pipeline({
    id: 'ticket-triage',
    inputSchema: ticketSchema,
})
    .parallel({
    id: "parallel-1",
    branches: {
        classification: classifyTicket,
        policy: checkPolicy,
        impact: estimateImpact,
    }
})
    .step({
    id: "step-1",
    run: ({ input: input }) => (({ classification, policy, impact }) => ({
        category: classification.category,
        allowed: policy.allowed,
        priority: impact.priority,
    }))(input)
});

```

Every branch receives the same validated value. The joined object uses the branch names as keys.

## 2. Run one pipeline over many inputs

```ts
const results = await triage.runBatch({
    inputs: tickets,
    concurrency: 3
});

```

At most three inputs are active at once. Successful results preserve the input order even when individual items finish out of order.

## 3. Separate concurrency from durability

Both primitives run in the current JavaScript process. They do not persist progress, schedule delayed work, or survive a restart.

Use them for bounded in-process work. Put long, expensive, or restart-sensitive operations behind a durable queue and store user-visible status in the product database.

## 4. Continue through the section

- [Build parallel branches](/sdk/advanced/parallel-and-batch/parallel)
- [Run batches](/sdk/advanced/parallel-and-batch/batch)
- [Set concurrency limits](/sdk/advanced/parallel-and-batch/concurrency)
- [Handle failures and results](/sdk/advanced/parallel-and-batch/failures)
- [Operate long-running jobs](/sdk/advanced/parallel-and-batch/jobs)
- [Design retries and idempotency](/sdk/advanced/parallel-and-batch/retries)
- [Review the production checklist](/sdk/advanced/parallel-and-batch/checklist)
