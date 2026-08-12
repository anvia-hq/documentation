# Parallel pipeline

**Level:** Pattern

## Outcome

Run independent analyses concurrently, retain named typed results, and merge them only after every
branch succeeds.

## When to use it

Use named parallel branches when all branches consume the same input and do not depend on each
other—for example classification, risk detection, and priority estimation. Keep dependent work in
sequential `.step()` or `.use()` stages.

## Flow and semantics

```text
validated incident -> [classification | signals | priority] -> merged triage
```

Anvia starts the branch operations with `Promise.all`. Output keys match the branch keys. A rejected
branch rejects the parallel stage; sibling promises are not a durable job system and may continue
their already-started work.

## Setup and implementation

```sh
pnpm add @anvia/core zod
```

```text
src/
  schema.ts    # incident contract
  branches.ts  # independent analyses
  pipeline.ts  # fan-out and merge
  run.ts       # observer and example input
```

::: code-group

```ts [src/schema.ts]
import { z } from "zod";

export const Incident = z.object({
  id: z.string(),
  summary: z.string().trim().min(1),
});

export type IncidentType = z.infer<typeof Incident>;
```

```ts [src/branches.ts]
import { PipelineBuilder } from "@anvia/core/pipeline";
import { Incident } from "./schema.js";

export const classification = new PipelineBuilder(Incident)
  .step(({ summary }) => ({
    topic: summary.toLowerCase().includes("payment") ? "billing" : "operations",
  }))
  .build();

export const signals = new PipelineBuilder(Incident)
  .step(({ summary }) => ({
    outage: summary.toLowerCase().includes("outage"),
    missedOrders: summary.toLowerCase().includes("missed orders"),
  }))
  .build();

export const priority = new PipelineBuilder(Incident)
  .step(({ summary }) => ({
    priority: /outage|missed orders/i.test(summary) ? "high" as const : "normal" as const,
  }))
  .build();
```

```ts [src/pipeline.ts]
import { PipelineBuilder } from "@anvia/core/pipeline";
import { classification, priority, signals } from "./branches.js";
import { Incident } from "./schema.js";

export const triage = new PipelineBuilder(Incident, { id: "incident-triage" })
  .parallel({ classification, signals, priority }, { name: "Analyze incident" })
  .step(
    (result) => ({
      ...result.classification,
      ...result.signals,
      ...result.priority,
    }),
    { name: "Merge triage" },
  )
  .build();
```

```ts [src/run.ts]
import type { PipelineRunObserver } from "@anvia/core/pipeline";
import { triage } from "./pipeline.js";

const observer: PipelineRunObserver = {
  onEvent(event) {
    if (event.type === "stage_failed") {
      console.error(event.node.label, event.error);
    }
  },
};

console.log(await triage.run({
  id: "inc_123",
  summary: "Payment outage caused missed orders.",
}, { observer }));
```

:::

Run the composed pipeline:

```sh
pnpm tsx src/run.ts
```

## Expected behavior

The result is `{ topic: "billing", outage: true, missedOrders: true, priority: "high" }`.
`PipelineRunObserver` receives lifecycle events, but it does not persist them or retry stages.

## Failure, security, and ownership

Avoid non-idempotent writes inside concurrent branches unless each write has its own idempotency
key. Cap concurrency at the outer request or job layer because `.parallel()` starts every declared
branch. Redact stage errors before returning them to clients. Your application owns deadlines,
cancellation, access checks, durable state, and compensation for partially completed side effects.

## Tests and production adaptations

Test every branch independently, then assert the merged shape. Add a failure test proving that one
rejection rejects the run. In production, put slow or variable fan-out behind bounded worker queues;
use `.parallel()` for a small, known set of branches.

## Source and extensions

- Source: [`05_pipelines/04-named-parallel.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/05_pipelines/04-named-parallel.ts)
- Read [parallel and batch pipelines](/sdk/pipelines/parallel-and-batch).
- Extend with provider-backed classification, per-branch telemetry, or an explicit partial-result policy.
