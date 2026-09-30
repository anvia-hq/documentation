# Tips

**You do not need every metric.** Choose the metrics that answer a useful question about your cases. One well-chosen check can be enough for a simple task; a more complex task may need several checks for different requirements.

Adding metrics is useful when they reveal a failure you care about. More scores alone do not make an evaluation more trustworthy.

## Start with what success means

Before choosing a metric, finish this sentence: **“This case succeeds when…”**

For example, “This case succeeds when the answer states the correct refund window and adds no unsupported exceptions.” That gives you two requirements to measure: the refund fact and the support for any additional claims.

Choose a metric for each requirement you need evidence for. If you cannot explain what you would change after a metric fails, reconsider whether that metric belongs in the suite.

## Match the metric to the case

Different tasks need different evidence. These are starting points, not mandatory combinations.

| Case or task | What you want to measure | Metrics to consider |
| --- | --- | --- |
| Return an order status | The value is exactly right. | [exactMatch](/lens/evaluations/metrics/exact-match) |
| Answer a policy question | A required phrase appears. | [contains](/lens/evaluations/metrics/contains), if phrase presence is enough |
| Return a JSON ticket | Syntax, fields, and value types match the contract. | [jsonCorrectness](/lens/evaluations/metrics/json-correctness) |
| Answer using retrieved documents | Claims are supported, and the answer addresses the question. | [faithfulness](/lens/evaluations/metrics/faithfulness), optionally [answerRelevancy](/lens/evaluations/metrics/answer-relevancy) |
| Handle a question with insufficient evidence | The assistant declines appropriately. | [abstention](/lens/evaluations/metrics/abstention) |
| Summarize a document | Key information survives without unsupported additions. | [summarization](/lens/evaluations/metrics/summarization) |
| Continue a conversation | Earlier user facts are retained. | [knowledgeRetention](/lens/evaluations/metrics/knowledge-retention) |
| Follow a product-specific rule | The answer satisfies a defined rubric. | [llmJudge](/lens/evaluations/metrics/llm-judge), [llmScore](/lens/evaluations/metrics/llm-score), or [gEval](/lens/evaluations/metrics/g-eval) |

For example, a status lookup does not need a summarization metric. A single answer does not provide the conversation needed for a retention check.

## Start small, then add checks for real failures

Start with the simplest metric that detects the failure you are trying to prevent. A direct equality, text, or schema check is usually easier to understand than a model judgment when the requirement has a fixed form.

This example checks only two requirements: the answer mentions the refund window, and it is not blank.

```ts
import { contains, exactMatch, runEvalSuite } from '@anvia/core/evals'

const result = await runEvalSuite({
  name: 'refund-policy',
  cases: [
    {
      id: 'refund-window',
      input: 'How long are refunds available?',
      expected: '30 days',
    },
  ],
  target: async () => 'Refunds are available for 30 days.',
  metrics: [
    contains<string, string, string>({ name: 'refund-window-present' }),
    exactMatch<string, string, string>({
      name: 'not-blank',
      actual: ({ output }) => output.trim().length > 0,
      expected: true,
    }),
  ],
})

console.log(result.results[0]?.scores)
```

Replace the fixed `target` with your agent or function. Both checks pass for this output. They do not establish that every claim is correct: an answer saying “Refunds are available for 30 days, plus an unlimited bonus” could also pass. If invented policy details are a real risk, add a grounding check with supporting context or a focused judge rubric.

## Give each metric the evidence it needs

`runEvalSuite()` applies its configured metrics to every case in that suite. Group cases that share the same requirements and input shape. Use separate suites when the checks needed for one task do not make sense for another.

For example, `faithfulness` needs retrieved passages, `hallucination` needs trusted context, and conversation metrics need conversation turns. Supply that evidence through the case or metric selectors. Missing evidence can produce an `invalid` result, which means the metric could not make a valid judgment.

Choose complementary checks when you need several properties. Relevance measures whether an answer stays on topic; faithfulness measures claim support. A high score on one does not establish the other.

## Set thresholds using examples you have reviewed

A threshold should reflect an acceptable result for your task. Try the metric on answers you know should pass and answers you know should fail, then inspect disagreements. The thresholds in the example pages are illustrations, not universal release requirements.

Include negative examples: a wrong fact, an empty answer, missing evidence, or a forgotten user detail. A check that passes every example may be measuring too little.

Read the score in the metric's own terms. `hallucination` improves as its score decreases; most numeric quality metrics improve as their scores increase. A score of `0.8` from one metric does not mean the same thing as `0.8` from another.

## Keep the suite useful over time

Judge metrics add model calls, latency, cost, and some variation. Keep them when their judgments help you make a decision, and review their explanations when results are surprising.

When a real failure escapes your suite, add a case that reproduces it. Add a new metric only if the existing checks cannot measure that failure. Keep case IDs, metric names, and rubrics stable when comparing releases; if a metric's meaning changes, give it a new name.

Use [the metric index](/lens/evaluations/metrics) to find the check you need, then [run evaluations](/lens/evaluations/run-evaluations) to collect results.
