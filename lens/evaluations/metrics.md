# Built-in evaluation metrics

Choose the behavior you need to check, then open the metric’s page. Each page explains **when to use it, why, how to configure it, and what its result means**, with its own TypeScript example.

All 31 metrics are exported from `@anvia/core/evals` and run inside `runEvalSuite()`.

Each case result exposes `scores`, a map keyed by each metric's `name`. The default name is the snake_case form of the metric, such as `exact_match` for `exactMatch()` or `answer_relevancy` for `answerRelevancy()`; pass `name` to choose your own. Read `scores.<name>` for that metric’s `outcome` (`pass`, `fail`, or `invalid`), `score`, and `comment`; the boolean or number a page calls "the score" is `scores.<name>.score`. `gEval` and `predicate` have no default: you always name them.

## Where to start

- **A fixed value or phrase:** start with [exactMatch](/lens/evaluations/metrics/exact-match) or [contains](/lens/evaluations/metrics/contains).
- **An answer based on documents:** start with [faithfulness](/lens/evaluations/metrics/faithfulness), then add [answerRelevancy](/lens/evaluations/metrics/answer-relevancy).
- **A JSON contract:** use [jsonCorrectness](/lens/evaluations/metrics/json-correctness).
- **Your own quality rule:** use [llmJudge](/lens/evaluations/metrics/llm-judge) for pass/fail or [llmScore](/lens/evaluations/metrics/llm-score) for a graded score.
- **A conversation:** use [turnRelevancy](/lens/evaluations/metrics/turn-relevancy) and [knowledgeRetention](/lens/evaluations/metrics/knowledge-retention).

Start with one clear requirement. Add another metric when it catches a different failure that matters to your users.

Read [Tips](/lens/evaluations/metrics/tips) for how to choose a focused set of metrics for your cases.

## Text and structure

| Metric | What it checks |
| --- | --- |
| [exactMatch](/lens/evaluations/metrics/exact-match) | Checks whether the output equals the expected value. |
| [contains](/lens/evaluations/metrics/contains) | Checks whether the answer includes a required phrase or pattern. |
| [notContains](/lens/evaluations/metrics/not-contains) | Checks whether the answer avoids a forbidden phrase or pattern. |
| [containsAll](/lens/evaluations/metrics/contains-all) | Checks whether every required phrase or pattern appears in the answer. |
| [containsAny](/lens/evaluations/metrics/contains-any) | Checks whether at least one accepted phrase or pattern appears in the answer. |
| [matches](/lens/evaluations/metrics/matches) | Checks whether output text matches a regular expression. |
| [doesNotMatch](/lens/evaluations/metrics/does-not-match) | Checks whether output text avoids a forbidden regular expression. |
| [maxLength](/lens/evaluations/metrics/max-length) | Checks whether output text stays within a character limit. |
| [requiredFields](/lens/evaluations/metrics/required-fields) | Checks whether an object contains all required top-level fields. |
| [jsonCorrectness](/lens/evaluations/metrics/json-correctness) | Checks whether output text is valid JSON and satisfies a Zod schema. |
| [notBlank](/lens/evaluations/metrics/not-blank) | Checks whether the answer contains anything other than whitespace. |
| [schemaMatch](/lens/evaluations/metrics/schema-match) | Checks whether the output satisfies a Zod schema. |
| [predicate](/lens/evaluations/metrics/predicate) | Runs an application-owned rule with a comment on failure. |

## Meaning and custom judgments

| Metric | What it checks |
| --- | --- |
| [semanticSimilarity](/lens/evaluations/metrics/semantic-similarity) | Compares the meaning of an answer with a reference answer using embeddings. |
| [llmJudge](/lens/evaluations/metrics/llm-judge) | Uses a model to produce a structured judgment and applies your pass/fail rule. |
| [llmScore](/lens/evaluations/metrics/llm-score) | Uses a model to score an answer against your criteria and return feedback. |
| [gEval](/lens/evaluations/metrics/g-eval) | Uses explicit evaluation steps or criteria to score a custom quality requirement. |

## Answer quality and grounding

| Metric | What it checks |
| --- | --- |
| [answerRelevancy](/lens/evaluations/metrics/answer-relevancy) | Checks whether an answer stays relevant to the user’s question. |
| [promptAlignment](/lens/evaluations/metrics/prompt-alignment) | Checks whether an answer follows the instructions you specify. |
| [hallucination](/lens/evaluations/metrics/hallucination) | Measures whether an answer contradicts trusted context passages. |
| [faithfulness](/lens/evaluations/metrics/faithfulness) | Checks whether factual claims in the answer are supported by retrieved evidence. |
| [abstention](/lens/evaluations/metrics/abstention) | Checks whether the assistant appropriately answers or declines to answer. |
| [summarization](/lens/evaluations/metrics/summarization) | Checks whether a summary preserves important source facts and stays grounded. |

## Agent trajectories

| Metric | What it checks |
| --- | --- |
| [toolCalled](/lens/evaluations/metrics/agent-metrics) | Checks that the agent called a tool within a call budget. |
| [toolNotCalled](/lens/evaluations/metrics/agent-metrics) | Checks that the agent never called a tool. |
| [toolCallOrder](/lens/evaluations/metrics/agent-metrics) | Checks that the agent called tools in a required order. |
| [maxTurns](/lens/evaluations/metrics/agent-metrics) | Checks that the run stayed within a turn budget. |
| [maxTokens](/lens/evaluations/metrics/agent-metrics) | Checks that the run stayed within a token budget. |
| [maxDurationMs](/lens/evaluations/metrics/agent-metrics) | Checks that the run stayed within a duration budget. |

## Conversations

| Metric | What it checks |
| --- | --- |
| [turnRelevancy](/lens/evaluations/metrics/turn-relevancy) | Checks whether assistant replies stay relevant across a conversation. |
| [knowledgeRetention](/lens/evaluations/metrics/knowledge-retention) | Checks whether the assistant preserves information the user supplied earlier. |

## Call forms

Text metrics that compare against an expectation (`exactMatch`, `contains`, `notContains`, `containsAll`, `containsAny`, `matches`, and `doesNotMatch`) accept a positional value, an options object, or nothing at all. Called with no expectation, they fall back to `case.expected`, and the case type then requires that field:

```ts
metrics: [
  contains(),                    // reads case.expected
  contains('30 days'),           // positional
  contains({ expected: '30 days', caseSensitive: false }),
  contains(/30 days/i),          // a RegExp keeps its own flags
]
```

Other metrics need their configuration up front:

- `notBlank()` takes no expectation.
- `maxLength(max)` and `requiredFields(fields)` take their limit or field list, positionally or as `max` and `expected`.
- `schemaMatch(schema)` takes a Zod schema.
- `predicate(name, check)` takes its name first.
- Model-backed metrics take an options object with a `model` plus what they judge, such as `schema` and `passes` for `llmJudge`, or `criteria` for `llmScore`.
- The agent metrics take the tool name, tool list, or budget positionally.

Only `exactMatch` accepts `trim`; `caseSensitive` applies to string expectations and is ignored for a `RegExp`, which keeps its own flags. Share one judge model and its defaults with `createJudgeMetrics({ model, includeReason: 'on-fail' })`, which returns the same judge metrics with `model` optional per metric.

## Judge model settings

Model-backed metrics (`llmJudge`, `llmScore`, `gEval`, the answer quality and grounding metrics, `jsonCorrectness`, and the conversation metrics) accept two call settings. You can set both per metric or once through `createJudgeMetrics`:

| Option | Default | Effect |
| --- | --- | --- |
| `retries` | `0` | Extra attempts for a failed judge call. |
| `temperature` | omitted | Sampling temperature for judge calls. It is sent only when you set it. |

Since `@anvia/core` 1.24.1, judge calls omit `temperature` unless you set it, so the provider's default applies. Earlier releases sent `temperature: 0`. Set a temperature only when the judge model accepts one. Models that declare they do not support it reject the request before any provider call. The Anthropic adapter (`@anvia/anthropic` 1.4.2 and later) is one of them. The metric then records `invalid` with kind `configuration`. To reduce judge variance, use narrow criteria, reviewed thresholds, and [trials](/sdk/evaluations/trials-and-caching) instead of relying on temperature.

Judges return structured verdicts through `extract()`. Since `@anvia/core` 1.25.0, a judge model that declares `capabilities.forcedToolChoice: false`, such as `claude-haiku-5-5` or `claude-sonnet-5-5`, receives `toolChoice: 'auto'` instead of a forced submit call. A reply without the submit call is retried within `extract()` and, if it still fails, the metric records `invalid`.

`semanticSimilarity` calls an embedding model, not a judge, so these settings do not apply to it.

## Invalid results

`invalid` means the metric could not make a judgment, which is different from a failed check. An invalid outcome always carries a `reason`. When it comes from a thrown error, it also carries a `kind`:

| Kind | Typical cause |
| --- | --- |
| `target` | The target threw, so no output reached the metrics. |
| `metric` | The metric itself threw, such as a selector failure or unusable judge output. |
| `provider` | The judge or embedding provider returned an API error, including HTTP 4xx and 5xx responses. |
| `configuration` | The request asked for something the model does not support, such as `temperature` on a model that rejects it. |
| `timeout` | The case exceeded its `timeout`. |

When a metric throws, the runner infers the kind from the error and its causes, and includes the underlying cause message in `reason`. A custom metric can do the same with `EvalOutcome.fromError(error)`. A metric that returns `EvalOutcome.invalid(reason)` on its own, such as `llmScore` with an out-of-range score, carries a reason but no kind. Inspect invalid results separately from failures: a provider outage or a configuration mistake is not evidence about answer quality.

Continue with [What to evaluate](/lens/evaluations/what-to-evaluate) to design cases or [Run evaluations](/lens/evaluations/run-evaluations) to execute a suite.
