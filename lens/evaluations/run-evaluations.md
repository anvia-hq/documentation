# Run evaluations

Run evaluation suites with `@anvia/core`, then use `@anvia/lens` to send their lifecycle, results, and related traces to the current Lens project.

The easiest integration is `lens.evals()`. It creates a tracing observer and a matching evaluation reporter from the same environment configuration, and flushes when a run ends.

## Configure the project connection

Install the SDK packages in the process that runs the evaluation:

```sh
pnpm add @anvia/core @anvia/lens
```

Set the Lens ingestion credentials and stable deployment context:

```dotenv
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk-lens-...
ANVIA_LENS_SECRET_KEY=sk-lens-...
ANVIA_LENS_SERVICE_NAME=support-evals
ANVIA_LENS_ENVIRONMENT=staging
ANVIA_LENS_RELEASE=2026.08.1
```

The key pair selects the project. `serviceName`, `environment`, and `release` make runs filterable and future comparisons understandable.

## Create the integration once

```ts
import { lens } from '@anvia/lens'

const evaluation = lens.evals<string, PromptResponse, string>({
  includePayloads: true,
  includeMetadata: true,
  onMissingTrace: 'throw',
})
```

`lens.evals()` provides:

- `observer` for the agent or target being tested;
- `reporter` for `runEvalSuite()`;
- `flush()` for an explicit delivery boundary;
- `shutdown()` for process cleanup.

It flushes at the end of each run by default. Use `shutdown()` before the process exits so both trace and evaluation exporters close cleanly.

## Run a complete suite

The target must use the same observer as the reporter if you want each result linked to its agent trace:

```ts
import { AgentBuilder } from '@anvia/core'
import { agentEvalTarget, contains, runEvalSuite } from '@anvia/core/evals'
import type { PromptResponse } from '@anvia/core/request'
import { lens } from '@anvia/lens'

const evaluation = lens.evals<string, PromptResponse, string>({
  includePayloads: true,
  includeMetadata: true,
  onMissingTrace: 'throw',
})

const agent = new AgentBuilder('support-policy-agent', model)
  .name('Support policy agent')
  .instructions([
    'Answer with only the relevant policy fact.',
    'Refunds are available for 30 days.',
    'Workspace owners can change billing settings.',
  ].join('\n'))
  .observe(evaluation.observer)
  .build()

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
    target: agentEvalTarget<string>(agent),
    metrics: [
      contains<string, PromptResponse, string>({
        name: 'policy-fact-present',
        actual: ({ output }) => output.output,
      }),
    ],
    reporters: [evaluation.reporter],
    failOnReporterError: true,
  })

  console.log('Lens run ID:', suite.run.id)
  console.log({
    passed: suite.metrics.passed,
    failed: suite.metrics.failed,
    invalid: suite.metrics.invalid,
  })
} finally {
  await evaluation.shutdown()
}
```

Open **Evaluations → Runs** and search for the printed run ID. The run should contain two cases, one metric result per case, and trace coverage for both agent calls.

## Understand trace correlation

`agentEvalTarget()` returns the Anvia prompt response, which carries its trace reference. The eval runner resolves that reference and the Lens reporter associates the metric result with the relevant trace and observation.

`onMissingTrace` controls what the reporter does when it cannot resolve a valid trace and observation:

| Value | Behavior |
| --- | --- |
| `emit` | Report the result without trace context. This is the default. |
| `ignore` | Skip that result. |
| `warn` | Skip the result and write a console warning. |
| `throw` | Fail reporting, which can fail the suite when `failOnReporterError` is enabled. |

Use `throw` in a controlled CI suite when trace linkage is required evidence. Use `emit` when evaluating a plain function that is not traced.

## Choose what to capture

Trace bodies and evaluation payloads are separate controls:

| Option | Default | Effect |
| --- | --- | --- |
| `captureMode` | `safe` | Controls traced prompt and response bodies. |
| `includePayloads` | `false` | Includes case input, expected value, context, retrieval context, and target output. |
| `includeMetadata` | `false` | Includes case, metric, outcome, and run metadata. |
| `publishInvalid` | `true` | Reports invalid evaluator or target outcomes. |

Evaluation payloads use the tracing instance's redaction transforms and `captureMaxBytes` limit. If a payload cannot be serialized or exceeds the limit, Lens retains the result and records why the payload is unavailable.

Synthetic regression cases can reasonably use full capture. Production-derived cases need an explicit privacy decision; start with payloads disabled when unsure.

## Use the lower-level reporter when needed

Use `lens.create()` with `createLensEvalReporter()` when the process already owns a shared Lens observer or when several suites should share one exporter:

```ts
import { createLensEvalReporter, lens } from '@anvia/lens'

const tracing = lens.create()
const reporter = createLensEvalReporter(tracing, {
  includePayloads: true,
  onMissingTrace: 'throw',
  flushOnRunEnd: true,
})
```

Attach `tracing` to the target, pass `reporter` to every suite, and call `tracing.shutdown()` once at the process boundary.

## Reporter failures and suite failures

`failOnReporterError: true` makes missing required trace context or export-reporter errors visible to the evaluation job. Without it, the suite can finish and return reporter errors in its result even when some evidence was not delivered.

This setting does not turn failed metrics into thrown errors. A suite with quality failures normally completes, reports those failures, and lets CI or a later quality gate decide whether the release should proceed.

## Concurrency and cost

`runEvalSuite()` processes one case at a time unless `concurrency` is set. Increase it carefully:

```ts
const suite = await runEvalSuite({
  ...options,
  concurrency: 4,
})
```

Concurrency can reduce runtime but also increase provider rate-limit pressure and simultaneous tool load. Model-graded metrics make additional provider calls, so account for evaluation tokens separately from target tokens.

Continue with [Evaluation runs](/lens/evaluations/runs) to inspect the execution as a whole, or [Results](/lens/evaluations/results) to investigate individual metric outcomes across runs.
