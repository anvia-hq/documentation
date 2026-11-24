# Can I run evaluations without Lens?

Yes. `@anvia/core/evals` runs evaluation suites in tests or CI without Lens. Lens adds retained, team-oriented reporting: datasets, release comparisons, and quality gates linked to traces.

```ts
import { defineEvalSuite, exactMatch, runEvalSuite } from '@anvia/core/evals'

const suite = defineEvalSuite({
  name: 'ticket-normalization',
  cases: [{ id: 'trim', input: ' checkout failed ', expected: 'checkout failed' }],
  target: async (input) => input.trim(),
  metrics: [exactMatch({ name: 'normalized' })],
})

const result = await runEvalSuite(suite)
if (result.cases.failed > 0 || result.cases.invalid > 0) {
  throw new Error('Evaluation regression.')
}
```

## What does Core include?

- Agent targets through `agentEvalTarget()`.
- Deterministic metrics such as `exactMatch`, `contains`, and `requiredFields`.
- Trajectory metrics such as `toolCalled` and `maxTurns`.
- Model-scored metrics such as `llmJudge`.
- Repeated trials with pass@k and minimum pass rates, plus target caching.
- A CI runner (`runEvalCli`) and baseline comparison (`compareEvalResults`).

## When should I add Lens?

Add Lens when the team needs retained evaluation history, managed datasets, release comparisons, and failed cases linked to their traces. Core suites can report to Lens, Langfuse, or OpenTelemetry through the observability adapters.

See [Evaluations](/features/evaluations), the [SDK evaluation guide](/sdk/evaluations), [CLI and baselines](/sdk/evaluations/cli-and-baselines), [trials and caching](/sdk/evaluations/trials-and-caching), and [Lens evaluations](/lens/evaluations).
