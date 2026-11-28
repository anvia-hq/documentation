# Evaluate an agent

**Level:** Application

## Outcome

Turn product expectations into a repeatable suite that runs an Anvia agent against versioned cases,
combines deterministic and model-based metrics, and produces machine-readable results.

## When to use it

Run evals before changing models, prompts, tools, retrieval, or runtime versions. Keep unit tests for
deterministic code; use evals for behavior whose wording or reasoning varies.

## Architecture

```text
versioned cases -> agentEvalTarget({ agent, request }) -> outputs/traces
               -> deterministic metrics + judge metrics -> suite result/reporters
```

## Setup and agent target

Install `@anvia/core` and `@anvia/anthropic`, and set `ANTHROPIC_API_KEY`. Keep the agent in its own
module in a real application so the app and the suite import the same definition; it is inline here
so the example runs on its own.

```ts
import { AnthropicClient } from "@anvia/anthropic";
import { Agent } from "@anvia/core";
import {
  agentEvalTarget,
  assertEvalPassed,
  contains,
  createJudgeMetrics,
  notBlank,
  printEvalResult,
  runEvalSuite,
} from "@anvia/core/evals";

const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const supportAgent = new Agent({
  id: "support-policy",
  model: anthropic.completionModel({ modelId: "claude-sonnet-5" }),
  instructions:
    "Answer billing questions in one short sentence. Facts: refunds are available within 30 days; " +
    "only Workspace owners can change billing.",
});

// A smaller model grades subjective quality. Leave `temperature` unset: Anthropic models reject it.
// `llmScore` returns its own `feedback` as the outcome comment; `includeReason` only affects the
// task-specific judges (such as `answerRelevancy`) and `gEval`. Claude Haiku 5.5 does not accept forced
// tool choice, so judges ask it with `toolChoice: 'auto'` and retry a reply that skips the submit tool.
const judge = createJudgeMetrics({
  model: anthropic.completionModel({ modelId: "claude-haiku-5-5" }),
});

const result = await runEvalSuite({
  name: "support-policy-v3",
  cases: [
    { id: "refund-window", input: "When can I request a refund?", expected: "30 days" },
    { id: "billing-owner", input: "Who changes billing?", expected: "Workspace owners" },
  ],
  target: agentEvalTarget(supportAgent),
  metrics: [
    notBlank(),
    contains({ caseSensitive: false }),
    judge.llmScore({
      name: "answers_directly",
      threshold: 0.75,
      criteria: "The reply directly answers the customer's question without inventing policy.",
    }),
  ],
  concurrency: 2,
});

printEvalResult(result);
assertEvalPassed(result);
```

`agentEvalTarget(supportAgent)` sends each string input as the prompt and returns the full
`AgentResponse`; text metrics read its `output` field automatically. Scores are keyed by metric name:
`scores.not_blank`, `scores.contains`, and `scores.answers_directly` here.

Start with deterministic checks. Add `semanticSimilarity`, `llmJudge`, `llmScore`, RAG metrics, or
conversation metrics only when they measure a defined product requirement. Judge metrics make model
calls and introduce cost and variance. Judges omit `temperature` by default; set it only for a judge
model that accepts it.

See the [built-in metric reference](/lens/evaluations/metrics) for what each metric checks and when to use it.

## Expected behavior and failure scenarios

Each case contains metric outcomes of pass, fail, or invalid, and the suite aggregates totals. Invalid
means the target or metric could not produce a valid judgment; do not silently count it as a pass. Its
`kind` (`target`, `metric`, `configuration`, `provider`, or `timeout`) tells you where to look: a
judge that rejects `temperature`, for example, is a `configuration` error. Network errors,
judge schema failures, missing expected values, and rate limits need visible reporting.

## Security and production ownership

Use synthetic or approved datasets, redact inputs before external judges/reporters, and separate
tenant data. Pin case, prompt, model, retrieval, and evaluator versions so comparisons are meaningful.
Your CI or release system owns pass thresholds and deployment decisions; `runEvalSuite()` returns the
evidence.

## Tests and validation

Unit-test custom metrics with known pass, fail, and invalid inputs. Add negative controls that must
fail, otherwise a broken metric can make every candidate look good. Track variance by repeating
model-judged cases and manually review a sample of disagreements.

## Source and extensions

- Sources: [`08_evals`](https://github.com/anvia-hq/anvia/tree/main/cookbook/08_evals)
- Continue to [quality gates](/examples/production/quality-gates) and [testing agents](/examples/production/testing-agents).
- Extend with Lens, Langfuse, or OTel reporters; slice results by capability and risk level.
