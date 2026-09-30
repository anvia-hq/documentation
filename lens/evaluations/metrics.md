# Built-in evaluation metrics

Choose the behavior you need to check, then open the metric’s page. Each page explains **when to use it, why, how to configure it, and what its result means**, with its own TypeScript example.

All 22 metrics are exported from `@anvia/core/evals` and run inside `runEvalSuite()`.

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

## Conversations

| Metric | What it checks |
| --- | --- |
| [turnRelevancy](/lens/evaluations/metrics/turn-relevancy) | Checks whether assistant replies stay relevant across a conversation. |
| [knowledgeRetention](/lens/evaluations/metrics/knowledge-retention) | Checks whether the assistant preserves information the user supplied earlier. |

Continue with [What to evaluate](/lens/evaluations/what-to-evaluate) to design cases or [Run evaluations](/lens/evaluations/run-evaluations) to execute a suite.
