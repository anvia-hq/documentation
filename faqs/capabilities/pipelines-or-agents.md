# Should I use a pipeline or an agent?

Use an agent for an adaptive model-and-tool loop. Use a pipeline when the application knows the stages and benefits from typed input, deterministic transformations, parallel branches, or an inspectable graph.

| Workflow | Prefer |
| --- | --- |
| The model decides whether and which tool to call | [Agent](/sdk/agents) |
| Normalize input, load data, classify, then format output | [Pipeline](/sdk/pipelines) |
| One model call | [Completion](/sdk/completions) |
| A fixed sequence that includes model reasoning | Pipeline with an agent or extractor stage |

## Can a pipeline contain an agent?

Yes. Keep normalization, authorization, database work, branching, and response shaping in ordinary TypeScript steps. Use an agent stage only where adaptive reasoning or a tool loop adds value, and use an extractor when existing content must become validated fields.

See [Agents and extractors](/sdk/pipelines/agents-and-extractors).

## Is a pipeline a job queue?

No. A pipeline describes and runs the workflow. Long-running or retryable production work still needs worker infrastructure, durable job state, idempotency, and deployment-specific recovery. Read [Production workers](/sdk/pipelines/production-workers).

## When is neither necessary?

If one TypeScript function expresses the workflow clearly, keep the function. Pipelines add value through composition, typed boundaries, concurrency, and inspection—not merely by wrapping code in another abstraction.

Registered pipelines can be visualized and replayed locally in [Studio Pipelines](/studio/pipelines).
