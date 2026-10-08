# Jev

`@anvia/jev` connects Jev, through TypeSafe's official JavaScript SDK, to Anvia's [typed decisions](/sdk/decisions). It is a decision provider, not a completion provider: it supplies a `DecisionModel` for `decide()` and `decideBatch()` rather than a model for agents.

```ts
import { JevClient, JEV_LATEST } from '@anvia/jev'

export const jev = new JevClient({
  apiKey: process.env.TYPESAFE_API_KEY,
})

export const decisionModel = jev.decisionModel({ modelId: JEV_LATEST })
```

## What the client provides

- `decisionModel({ modelId })` for choice, multiple labels, rubric scores, and boolean probabilities
- `listModels()` for model inventory

Start with [Setup](/sdk/providers/jev/setup), then open the guide you need:

- [Decisions](/sdk/providers/jev/decisions)
- [Model listing](/sdk/providers/jev/model-listing)
- [Production](/sdk/providers/jev/production)

## Decision boundary

| Anvia question | Support |
| --- | --- |
| `choice` | Native |
| `score` | Native |
| `check` | Native |
| `multiLabel` | Composed from one independent question per label |

Mixed questions can share a request. Choice supports at most 255 options and score at most 10 levels. The adapter has no completion, embedding, OCR, media, or streaming model factory, so use another provider for agents and retrieval.

## Application responsibilities

The adapter maps questions, validates answers, normalizes usage, and lists models. Your application still owns the instructions, the action thresholds, retries and timeouts, data minimization, and retention.

See also the [`@anvia/jev` package reference](/packages/jev).
