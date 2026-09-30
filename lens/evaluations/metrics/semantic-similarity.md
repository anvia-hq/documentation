# semanticSimilarity

Compares the meaning of an answer with a reference answer using embeddings.

## When to use

A reference answer exists, but wording can differ.

## Why use it

Embeddings give a relatively simple meaning comparison without a judge completion.

## Example

Use your configured [embedding model](/sdk/models/embeddings) as `embeddingModel`. This metric makes embedding calls.

This example evaluates a fixed output so you can see what the metric checks. Replace `target` with your agent or function when building your own suite.

```ts
import { semanticSimilarity, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'semantic-similarity-example',
  cases: [
    {
      id: 'refund-meaning',
      input: 'How long are refunds available?',
      expected: 'You can request a refund within 30 days.',
    },
  ],
  target: async () => 'Refund requests are accepted for 30 days.',
  metrics: [
    semanticSimilarity({ model: embeddingModel, threshold: 0.8 }),
  ],
})

console.log(result.results[0]?.scores)
```

## Read the result

The wording differs, but the meanings are similar. The embedding model determines the cosine similarity; the example passes only if that score is at least `0.8`.

## What it needs

Requires an embedding `model`, reference `expected` text, and `threshold` from 0 to 1. Passes when cosine similarity meets the threshold. Similar wording does not prove factual correctness.

## Keep in mind

Cosine similarity can range from −1 to 1; the accepted threshold range is 0 to 1. Similarity is not a probability of correctness. A wrong number or negation can still look semantically close. Calibrate the threshold against known good and bad answers.

For an object returned by your target, use `actual` to select the value to check, such as `actual: ({ output }) => output.answer`. Anvia automatically reads the `output` field of an agent response.

An `invalid` result means the metric could not make a valid judgment, for example because required input was missing or a model call failed. Inspect it separately from a failed check.

## Related metrics

[exactMatch](/lens/evaluations/metrics/exact-match), [llmScore](/lens/evaluations/metrics/llm-score), [faithfulness](/lens/evaluations/metrics/faithfulness).

[All metrics](/lens/evaluations/metrics) · [Run evaluations](/lens/evaluations/run-evaluations)
