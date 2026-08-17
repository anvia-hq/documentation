# Run evaluations

Run evaluation suites with `@anvia/core`, then use one `LensClient` to create the trace observer and evaluation reporter that send evidence to the current Lens project.

## Configure the project connection

```sh
pnpm add @anvia/core @anvia/lens
```

```dotenv
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
ANVIA_LENS_SERVICE_NAME=support-evals
ANVIA_LENS_ENVIRONMENT=staging
ANVIA_LENS_RELEASE=2026.08.1
```

The key pair selects the project. `serviceName`, `environment`, and `release` make runs filterable and future comparisons understandable.

## Run a complete suite

The target must use an observer from the same client as the reporter when each result must link to its agent trace:

```ts
import { Agent } from '@anvia/core'
import type { AgentResponse } from '@anvia/core/agent'
import { agentEvalTarget, contains, runEvalSuite } from '@anvia/core/evals'
import { LensClient } from '@anvia/lens'

const lens = new LensClient()
const observer = lens.observer()
const reporter = lens.evalReporter<string, AgentResponse<string>, string>({
  includePayloads: true,
  includeMetadata: true,
  onMissingTrace: 'throw',
})

const agent = new Agent({
  id: 'support-policy-agent',
  model,
  name: 'Support policy agent',
  instructions: [
    'Answer with only the relevant policy fact.',
    'Refunds are available for 30 days.',
    'Workspace owners can change billing settings.',
  ].join('\n'),
  observability: { observers: { observer } },
})

try {
  const suite = await runEvalSuite({
    name: 'support-policy-regression',
    run: {
      datasetName: 'support-policy-cases',
      datasetVersion: 'v1',
      metadata: { source: 'ci' },
    },
    cases: [
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
    ],
    target: agentEvalTarget<string>({
      agent,
      request: ({ input }) => ({ prompt: input }),
    }),
    metrics: [
      contains<string, AgentResponse<string>, string>({
        name: 'policy-fact-present',
        actual: ({ output }) => output.output,
      }),
    ],
    reporters: [reporter],
    reporterErrorPolicy: 'throw',
  })

  await lens.flush()
  console.log('Lens run ID:', suite.run.id)
  console.log(suite.metrics)
} finally {
  await lens.close()
}
```

Open **Evaluations → Runs** and search for the printed run ID. The run should contain two cases, one metric result per case, and trace coverage for both agent calls.

## Understand trace correlation

`agentEvalTarget()` returns the completed `AgentResponse`, which carries its trace reference. The eval runner resolves that reference and the Lens reporter associates the metric result with the relevant trace and observation.

`onMissingTrace` accepts `emit`, `ignore`, `warn`, or `throw`. Use `throw` in controlled CI when trace linkage is required evidence. Use `emit` when evaluating a plain untraced function.

## Choose what to capture

Trace bodies and evaluation payloads are separate controls. `lens.observer({ captureMode: 'full' })` controls traced prompt and response bodies. The reporter's `includePayloads` controls case input, expected value, context, retrieval context, and target output; `includeMetadata` controls case, metric, outcome, and run metadata.

Synthetic regression cases can reasonably use full capture. Production-derived cases need an explicit privacy decision; start with payloads disabled when unsure.

## Reporter failures and suite failures

`reporterErrorPolicy: 'throw'` makes missing required trace context or export-reporter errors visible to the evaluation job. It does not turn failed metrics into thrown errors; CI or a later quality gate owns release policy.

`runEvalSuite()` processes one case at a time unless `concurrency` is set. Increase it carefully because model-graded metrics add provider calls, cost, and rate-limit pressure.

Continue with [Evaluation runs](/lens/evaluations/runs) or [Results](/lens/evaluations/results).
