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
versioned cases -> agentEvalTarget(agent) -> outputs/traces
               -> deterministic metrics + judge metrics -> suite result/reporters
```

## Setup and agent target

```ts
import { Agent } from "@anvia/core/agent";
import {
  agentEvalTarget,
  contains,
  exactMatch,
  runEvalSuite,
} from "@anvia/core/evals";
import type { PromptResponse } from "@anvia/core/request";

const cases = [
  { id: "refund-window", input: "When can I request a refund?", expected: "30 days" },
  { id: "billing-owner", input: "Who changes billing?", expected: "Workspace owners" },
];

const result = await runEvalSuite({
  name: "support-policy-v3",
  cases,
  target: agentEvalTarget<string>(supportAgent),
  metrics: [
    contains<string, PromptResponse, string>({
      actual: ({ output }) => output.output,
    }),
    exactMatch<string, PromptResponse, string>({
      name: "not_blank",
      actual: ({ output }) => output.output.trim().length > 0,
      expected: true,
    }),
  ],
  concurrency: 2,
});

console.log(result.metrics);
```

Start with deterministic checks. Add `semanticSimilarity`, `llmJudge`, `llmScore`, RAG metrics, or
conversation metrics only when they measure a defined product requirement. Judge metrics make model
calls and introduce cost and variance.

## Expected behavior and failure scenarios

Each case contains metric outcomes of pass, fail, or invalid, and the suite aggregates totals. Invalid
means the metric could not make a valid judgment; do not silently count it as a pass. Network errors,
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

- Sources: [`08_evals`](https://github.com/anvia-hq/anvia/tree/main/examples/cookbook/08_evals)
- Continue to [quality gates](/examples/production/quality-gates) and [testing agents](/examples/production/testing-agents).
- Extend with Lens, Langfuse, or OTel reporters; slice results by capability and risk level.
