# What to evaluate

Evaluate failures that would harm a user, violate a policy, or make a release operationally unacceptable. Start from the failure—not from a generic score such as “quality.”

A useful evaluation plan makes every check answer three questions:

1. What observable failure are we trying to prevent?
2. Which cases reproduce that risk?
3. What is the least subjective evaluator that can detect it?

## Turn risks into checks

For a support agent, the first evaluation map might look like this:

| Risk | Representative case | Useful check |
| --- | --- | --- |
| States the wrong policy | Ask for the refund window | Exact or contained expected fact |
| Invents a policy | Ask for an unsupported exception | Narrow LLM-judge rubric |
| Ignores the request | Ask a direct billing question | Answer relevancy |
| Returns malformed data | Request a structured escalation | JSON or schema correctness |
| Makes unsupported claims | Ask a question over retrieved documents | Faithfulness against retrieval context |
| Forgets an instruction | Correct a constraint, then test it later | Multi-turn retention check |
| Becomes too slow or expensive | Re-run the same cases for a candidate release | Trace duration and token comparison |

Write the failure in observable terms. “The answer says refunds last longer than 30 days” is testable. “The answer is bad” is not.

## Build representative cases

For every important behavior, include a mixture of:

- a normal request that should succeed;
- a boundary or ambiguous request where the agent must be careful;
- a production or review failure that should never regress;
- an adversarial request when safety, authorization, or privacy is involved.

Keep each case focused. If one case changes the prompt, tool availability, user role, and retrieval documents at the same time, a failure is difficult to diagnose.

```ts
const cases = [
  {
    id: 'refund-window',
    input: 'How long are refunds available?',
    expected: '30 days',
  },
  {
    id: 'billing-owner',
    input: 'Who can change billing settings?',
    expected: 'Workspace owners',
  },
  {
    id: 'unsupported-refund',
    input: 'Can every customer receive an unlimited refund?',
    expected: 'Do not invent an unlimited refund policy.',
  },
]
```

Case IDs should describe the behavior, not their position in an array. Prefer `refund-window` over `case-01`.

## Use the least subjective evaluator

### Deterministic checks

Use deterministic metrics when the acceptable result has a stable form. They are fast, inexpensive, and straightforward to debug.

```ts
import { contains } from '@anvia/core/evals'

const policyFact = contains({
  name: 'policy-fact-present',
  actual: ({ output }) => output.output,
})
```

`exactMatch`, `contains`, and structured-data checks are good fits for identifiers, policy facts, status values, and schema conformance. Avoid forcing a long natural-language response into an exact string comparison when several answers could be correct.

### Model-graded checks

Use a model-graded evaluator when correctness depends on meaning or a rubric. Give the judge one narrow responsibility and require an explanation that reviewers can inspect.

```ts
import { llmJudge } from '@anvia/core/evals'
import { z } from 'zod'

const policyJudge = llmJudge({
  name: 'policy-quality',
  model: judgeModel,
  schema: z.object({
    passed: z.boolean(),
    reason: z.string(),
  }),
  passes: (judgment) => judgment.passed,
  instructions:
    'Pass only when the answer follows the expected policy and invents no policy details.',
  prompt: ({ case: testCase, output }) => [
    `Question: ${testCase.input}`,
    `Expected behavior: ${testCase.expected ?? ''}`,
    `Agent answer: ${output.output}`,
  ].join('\n'),
})
```

Review the judge's explanations before relying on it for a release decision. When reviewers regularly disagree, tighten the rubric, add examples, or split unrelated properties into separate metrics.

### Retrieval checks

When evaluating retrieval-augmented answers, distinguish the retrieval result from the answer written from it:

- **Retrieval quality** asks whether the necessary source material was found.
- **Faithfulness** asks whether claims are supported by the retrieved material.
- **Answer quality** asks whether the response satisfies the user request.

Store relevant material in the case's `context` or `retrievalContext` when the evaluator requires it. Do not use answer relevancy as a substitute for grounding—a relevant answer can still invent facts.

### Operational checks

Trace duration and token use reveal regressions that answer-quality metrics cannot. Treat them as constraints alongside quality, not substitutes for it. A fast incorrect answer should still fail.

Operational comparisons become meaningful only when the baseline and candidate use comparable cases, suite names, and environments.

## Define the release expectation

Each metric should have a clear interpretation:

| Metric | Expected decision |
| --- | --- |
| `policy-fact-present` | Every required policy case passes. |
| `policy-quality` | No unsupported policy is introduced. |
| `structured-escalation` | Every emitted record satisfies the schema. |
| P95 trace duration | Candidate remains inside the team's regression budget. |
| Average total tokens | Candidate remains inside the team's efficiency budget. |

Do not hide several product requirements inside one overall score. Separate metrics make a failed run explainable and let a quality gate enforce the requirements independently.

## Avoid misleading suites

Common problems include:

- testing only happy paths;
- using a semantic judge for a value that can be checked exactly;
- changing the cases, target, and evaluator in the same comparison;
- renaming cases or metrics between baseline and candidate;
- treating a model-graded score as objective truth;
- accepting a small suite as proof of broad production safety;
- applying release thresholds before trace and result coverage are complete.

An evaluation suite is a maintained product contract. Add cases when they protect a named behavior or reproduce a useful failure, and review old cases when the product's expected behavior changes.

Continue with [Run evaluations](/lens/evaluations/run-evaluations) to execute the suite and report its evidence to Lens.
