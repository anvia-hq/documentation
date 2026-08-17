# Build a research assistant

**Level:** Application · **Estimated time:** 60 minutes

## Outcome

Build a research service that runs independent evidence and quality branches in parallel, then
asks a synthesis agent for a source-aware brief. It demonstrates a production-shaped boundary;
the search adapters below are application-owned and must be connected to approved sources.

## When to use it

Use this shape when a report needs more than one independent input and the branches can run
concurrently. Use a single agent with a search tool when the work is short and exploratory.

## Architecture

`POST /research` → validate topic → parallel source/quality pipelines → normalized evidence packet
→ synthesis agent → persisted report. Search credentials, allow-lists, and citation validation stay
outside the model.

```text
src/
  agents/synthesizer.ts
  pipelines/research.ts
  sources/search.ts
  schemas.ts
  server.ts
test/research.test.ts
```

## Setup

```sh
pnpm add @anvia/core @anvia/openai zod
```

Keep provider and search credentials in server-only environment variables.

## Define the evidence boundary

```ts
// src/schemas.ts
import { z } from "zod";

export const evidenceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  excerpt: z.string(),
  retrievedAt: z.string().datetime(),
});
export type Evidence = z.infer<typeof evidenceSchema>;
```

`searchApprovedSources(topic)` should fetch from an application allow-list, reject private network
destinations, cap response sizes, and return `Evidence[]`. Search results are untrusted content.

## Build parallel research branches

```ts
// src/pipelines/research.ts
import { Pipeline } from "@anvia/core/pipeline";
import { z } from "zod";
import { searchApprovedSources } from "../sources/search.js";
const sources = new Pipeline({ id: "research-sources", inputSchema: z.string() })
    .step({
    id: "step-1",
    run: ({ input: topic }) => searchApprovedSources(topic)
});
const quality = new Pipeline({ id: "research-quality", inputSchema: z.string() })
    .step({
    id: "step-2",
    run: async ({ input: topic }) => ({
        topic,
        caveats: ["Search coverage is bounded by the configured providers."],
    })
});
export const evidencePipeline = new Pipeline({
    id: "research-evidence",
    inputSchema: z.string(),
}).parallel({
    id: "parallel-1",
    branches: { sources, quality }
});

```

## Synthesize without inventing sources

```ts
// src/agents/synthesizer.ts
import { Agent } from "@anvia/core/agent";
import { OpenAIClient } from "@anvia/openai";

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });

export const synthesizer = new Agent({
  id: "research-synthesizer",
  model: client.completionModel({
      modelId: "gpt-5.5",
      api: "responses"
  }),
  instructions: [
    "Use only the supplied evidence packet.",
    "Separate findings, uncertainty, and next steps.",
    "Cite the supplied source URLs; never create a URL.",
  ].join("\n"),
});
```

The request handler runs `await evidencePipeline.run({ input: topic })`, serializes the bounded `result.output`, then
calls `await synthesizer.generate({ prompt: packet })`. Check for a completed agent result before using its `output`.
Store the packet beside the report so reviewers can inspect exactly what the model saw.

## Run and expected behavior

Send a concrete topic such as “changes in our public API over the last quarter.” Independent
branches complete before synthesis. The answer should contain findings, explicit caveats, and only
URLs present in the packet. Empty evidence should produce “insufficient evidence,” not a report.

## Failure cases

- A source times out: return a partial-evidence marker or fail according to your product contract.
- A source injects instructions: treat excerpts as data and keep tools independently authorized.
- A citation is absent from the packet: reject or flag the draft before publication.
- The client disconnects: cancellation does not undo completed external searches.

## Security and ownership

The application owns source allow-lists, network egress, credentials, document licensing,
retention, and publication approval. Anvia owns pipeline execution and agent orchestration. Never
let the model choose unrestricted URLs or treat a plausible citation as verification.

## Production changes and tests

Add deadlines per branch, bounded concurrency, durable job state, deduplication, provenance hashes,
and human review for consequential reports. Test branch failure, zero results, malicious excerpts,
duplicate sources, citation-set equality, cancellation, and deterministic synthesis with a fake
completion model.

## Runnable references

- [Research pipeline](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/05_pipelines/08-research-pipeline.ts)
- [Parallel specialists](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/07_multi_agent/02-parallel-specialists.ts)

The files above demonstrate current Anvia APIs. The service structure in this page is a suggested
application architecture, not a published runnable project.

## Extensions

Add a durable evidence cache, structured output for report sections, a reviewer queue, retrieval
evaluations, and Lens or OpenTelemetry traces with redacted inputs.
