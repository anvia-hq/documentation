# Pipelines

Pipelines combine deterministic TypeScript, agents, and extractors into a typed, inspectable workflow.

## Explore pipelines

| Page | Learn how to |
| --- | --- |
| [Typed input](/sdk/pipelines/typed-input) | Validate input before any work begins. |
| [Steps](/sdk/pipelines/steps) | Transform values with synchronous or asynchronous logic. |
| [Agents and extractors](/sdk/pipelines/agents-and-extractors) | Add model reasoning and schema-validated extraction. |
| [Composition](/sdk/pipelines/composition) | Reuse pipelines and name inspectable stages. |
| [Parallel and batch](/sdk/pipelines/parallel-and-batch) | Run independent branches or many inputs safely. |
| [Runs and errors](/sdk/pipelines/runs-and-errors) | Execute, observe, inspect, and map failures. |
| [Production workers](/sdk/pipelines/production-workers) | Move long-running workflows out of HTTP requests. |

## The pipeline flow

```text
Validate input → run typed stages → return final output
```

A pipeline is useful when work is more than one prompt: normalize input, load product data, ask an agent, extract fields, run independent checks, and shape the final result.

## Use ordinary TypeScript first

Keep normalization, authorization, database access, branching, side effects, and final response shaping in `.step(...)`. Use `.prompt(...)` only for model reasoning and `.extract(...)` only when existing content must become [structured data](/sdk/structured-output).

If one function already expresses the workflow clearly, it does not need a pipeline. Reach for a pipeline when typed composition, reusable stages, bounded batch work, or graph inspection adds practical value.
