# Research pipeline

**Level:** Application

## Outcome

Build a research service that validates a request, retrieves evidence from independent sources in
parallel, preserves provenance, and asks an agent to synthesize a bounded report. The application—not
the model—decides which sources are trusted and records the evidence used for the answer.

## When to use it

Use this structure for product research, incident summaries, policy comparison, or any workflow that
must combine independent evidence before generation. Do not use it when one deterministic lookup is
enough.

## Architecture and ownership

```text
HTTP/CLI boundary -> ResearchInput validation -> parallel source adapters
                                          |-> internal search
                                          `-> metrics snapshot
                         -> evidence packet -> synthesis agent -> report
```

`PipelineBuilder` owns typed stage composition and parallel branch execution. Your application owns
source credentials, authorization, freshness, citations, storage, and request-level time budgets.

## Setup

```sh
pnpm add @anvia/core @anvia/openai zod
```

## Implementation by boundary

First define the external contract and the evidence shape:

```ts
import { Agent } from "@anvia/core/agent";
import { PipelineBuilder } from "@anvia/core/pipeline";
import { OpenAIClient } from "@anvia/openai";
import { z } from "zod";

const ResearchInput = z.object({
  topic: z.string().trim().min(3).max(200),
  tenantId: z.string().uuid(),
});

type Evidence = {
  sourceId: string;
  title: string;
  excerpt: string;
  observedAt: string;
};
```

Keep data access in application-owned adapters. They must enforce tenant access before returning
content:

```ts
async function searchInternal(topic: string, tenantId: string): Promise<Evidence[]> {
  // Replace with an authorized database or vector-store query.
  return [{
    sourceId: "doc_runbook_42",
    title: "Webhook retry runbook",
    excerpt: `${topic}: inspect queue depth and payload-size rejection logs.`,
    observedAt: new Date().toISOString(),
  }];
}

async function readMetrics(topic: string, tenantId: string): Promise<Evidence[]> {
  // Replace with a server-side metrics client scoped to tenantId.
  return [{
    sourceId: "metric_retry_depth",
    title: "Retry queue snapshot",
    excerpt: `${topic}: queue depth is above the seven-day baseline.`,
    observedAt: new Date().toISOString(),
  }];
}
```

Build small branch pipelines, then combine their named outputs:

```ts
const internalSearch = new PipelineBuilder(ResearchInput)
  .step(({ topic, tenantId }) => searchInternal(topic, tenantId))
  .build();

const metricsSearch = new PipelineBuilder(ResearchInput)
  .step(({ topic, tenantId }) => readMetrics(topic, tenantId))
  .build();

const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
const synthesizer = new Agent({
  id: "research-synthesizer",
  model: openai.completionModel("gpt-5"),
  instructions: [
    "Use only the supplied evidence.",
    "Separate findings, uncertainty, and follow-up checks.",
    "Cite source IDs in square brackets. Never invent a source ID.",
  ].join("\n"),
});

export const researchPipeline = new PipelineBuilder(ResearchInput)
  .parallel({ internal: internalSearch, metrics: metricsSearch }, { name: "Collect evidence" })
  .step(({ internal, metrics }) => {
    const evidence = [...internal, ...metrics];
    if (evidence.length === 0) throw new Error("No authorized evidence was found.");
    return JSON.stringify({ evidence });
  }, { name: "Build evidence packet" })
  .prompt(synthesizer, { name: "Synthesize report" })
  .build();
```

## Run and expected behavior

```ts
const report = await researchPipeline.run({
  topic: "webhook retry failures",
  tenantId: "10e93df0-8e59-4a2e-a4a4-b12f37e64365",
});
console.log(report);
```

Both lookups begin concurrently. The final report should contain findings, caveats, next checks,
and only source IDs present in the packet. Exact prose is model-dependent.

## Failure scenarios

- One rejected parallel branch rejects the parallel stage; decide outside the pipeline whether
  partial evidence is acceptable.
- A provider or data-source timeout needs an application deadline and cancellation policy.
- A syntactically valid citation may still be unsupported; verify cited IDs against the packet.
- Re-running may observe newer data. Persist the evidence packet when reproducibility matters.

## Security and production adaptations

Authorize every source adapter using authenticated product identity. Never let the model choose an
unscoped tenant ID or arbitrary database filter. Add source size limits, prompt-injection filtering,
and an allowlist for source types. For long research jobs, enqueue the input and evidence-version ID
in an application-owned BullMQ or Trigger.dev job; Anvia does not provide durable queue semantics.

## Tests

Unit-test the pipeline with deterministic adapter fakes and a fake `CompletionModel`. Assert that an
unauthorized adapter returns no evidence, an empty packet stops before synthesis, and every citation
in the output belongs to the input packet. Run a small golden eval set separately from unit tests.

## Source and extensions

- Source: [`05_pipelines/08-research-pipeline.ts`](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/05_pipelines/08-research-pipeline.ts)
- Related: [Parallel pipelines](/sdk/pipelines/parallel-and-batch) and [evaluations](/examples/production/evaluations)
- Extend it with reranking, human review, an immutable evidence snapshot, and structured report output.
