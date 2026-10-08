# Evaluations

Evaluations compare a target's output with versioned product expectations. Import the runner, suites, metrics, and reporting types from `@anvia/core/evals`.

## Run an offline regression suite

Start with a deterministic target and metric so the suite runs without provider credentials:

```ts anvia-check
import { defineEvalSuite, exactMatch, runEvalSuite } from '@anvia/core/evals'

const suite = defineEvalSuite({
  name: 'ticket-normalization',
  cases: [
    { id: 'trim', input: ' checkout failed ', expected: 'checkout failed' },
    { id: 'collapse-spaces', input: 'password   reset', expected: 'password reset' },
  ],
  target: async (input) => input.trim().replace(/\s+/g, ' '),
  metrics: [exactMatch({ name: 'normalized' })],
  targetConcurrency: 2,
  metricConcurrency: 1,
  caseTimeoutMs: 5_000,
})

const result = await runEvalSuite(suite)
console.log(result.cases, result.metrics)

// Treat invalid judgments as failures of the CI gate as well.
if (result.cases.failed > 0 || result.cases.invalid > 0) {
  throw new Error('Ticket normalization regression.')
}
```

Case IDs identify stable scenarios. Required metric failures make the case fail; a target or metric error can make it invalid. Inspect `result.results` for each case's output, target status, scores, metric outcomes, durations, and errors. Add a negative control that must fail when you test a custom metric.

## Evaluate an agent

Use `agentEvalTarget({ agent, request })` to adapt an agent. Map the input with `request: ({ input }) => ({ prompt: input })`, then select `output.output` in metrics that inspect the agent's validated response. The adapter expects a completed response; blocked and suspended outcomes need a deliberate test or continuation strategy. See the complete [agent evaluation example](/examples/production/evaluations).

Use `createEvalTypes<Input, Output, Expected>()` and `EvalOutcome.pass`, `.fail`, or `.invalid` for typed custom metrics. Cases must contain the expected or context fields implicitly required by their metrics; explicit value selectors can replace those requirements.

## Choose metrics and judges

Start with deterministic metrics such as `exactMatch`, `contains`, `matches`, `maxLength`, and `requiredFields`. `semanticSimilarity` calls an embedding model. `llmJudge`, `llmScore`, and task-specific judge metrics call a completion model and add evaluation usage, cost, and variance.

Choose a metric for a defined product requirement. Pin dataset, prompt, model, and evaluator versions before comparing changes. Use approved or synthetic inputs and redact private data before external judges or reporters. See the [metric reference](/lens/evaluations/metrics) and [quality gates](/examples/production/quality-gates).

## Control execution and report results

`targetConcurrency` and `metricConcurrency` bound those phases separately; `concurrency` is a shorthand for both. Targets receive an optional third argument with a case `signal`, and metrics receive `signal` in their context. Pass it to external calls.

`caseTimeoutMs` covers the target and its metrics. A suite-level `signal` stops scheduling and rejects on abort with the original abort reason, including an explicit `null`. `failFast: true` rejects with `EvalFailFastError` after the first completed required failure or invalid case; it is distinct from pipeline batch behavior.

Select cases with `caseIds`, `caseFilter`, or `shard: { index, count }`. `selectEvalCaseIds(previousResult)` selects failed and invalid cases for a rerun. `onProgress` receives case, target, metric, and completion events.

Reporters receive run-start, per-metric, and run-end contexts. Their default `reporterErrorPolicy: 'collect'` records dispatch errors; `'throw'` fails the run. Inspect `reporterErrors` even when the suite resolves. `targetUsage` selects target usage, and `cost` configures cost accounting; keep target and evaluation usage distinct.

Use `runEvalCli({ ...suite, exitCode: true })` without expectations for a CI exit code: `1` for required failures and `2` for required invalid judgments. `formatEvalResult()` formats results without printing. Both support truncation and redaction; unredacted JSON may contain inputs, outputs, metadata, and error details. Your CI owns thresholds and release decisions.

Continue with [observability](/sdk/observability) to correlate target runs with evaluation evidence.

## Assert intentional negative cases

`defineEvalCases` preserves literal case IDs and input types. `defineEvalExpectations(suite, ...)`
checks case and metric names at compile time; neither helper validates untrusted data at runtime.
Use explicit outcomes for negative controls so an unexpected pass is also a regression:

```ts anvia-check expectations-example
import {
  assertEvalOutcomes, assertEvalTotals, defineEvalCases, defineEvalExpectations,
  defineEvalSuite, evalExitCode, exactMatch, runEvalCli,
} from '@anvia/core/evals'

const suite = defineEvalSuite({
  name: 'normalizer-controls',
  cases: defineEvalCases([
    { id: 'positive', input: ' hello ', expected: 'hello' },
    { id: 'negative', input: 'wrong', expected: 'right' },
  ]),
  target: async (input) => input.trim(),
  metrics: [exactMatch({ name: 'normalized' })],
})
const expectations = defineEvalExpectations(suite, {
  totals: { cases: { total: 2, passed: 1, failed: 1, invalid: 0 } },
  outcomes: { positive: { normalized: 'pass' }, negative: { normalized: 'fail' } },
})
const result = await runEvalCli({ ...suite, expectations, format: 'quiet' })
assertEvalTotals(result, expectations.totals!)
assertEvalOutcomes(result, expectations.outcomes!)
console.log(evalExitCode(result), evalExitCode(result, expectations)) // 1, 0
```

Both assertions throw `EvalAssertionError` with a `mismatches` array. Totals only compare specified
fields: top-level `total`, `passed`, `failed`, and `invalid` describe metrics; use `cases` for case
counts. Outcome expectations default unspecified required metrics to `pass`; explicitly named
optional metrics are checked too. Counts alone can miss one case replacing another.

Without expectations, `evalExitCode` returns `2` for a required invalid judgment, `1` for a required
failure, otherwise `0`. With expectations, a match returns `0`, including deliberately expected
fail/invalid outcomes. A mismatch returns `2` for an unexpected invalid judgment, otherwise `1`.
Use expected invalids only for tests of failure handling. An application quality gate should still
require sufficient valid judgments.

`runEvalCli({ ...suite, expectations, exitCode: true })` prints results and raises
`process.exitCode` to the computed code if it is larger than the current value. It does not call
`process.exit` or lower an existing code. `formatEvalResult` returns a string; `printEvalResult`
writes it. Both accept `format`, `maxValueLength`, and an application `redact` callback.

## Respond to agent interactions in evaluations

`agentEvalTarget` can resume approvals and questions using a deterministic test responder. This
complete example uses a fake model and a harmless tool; no provider or external operation runs:

```ts anvia-check responder-example
import { Agent, Usage, createQuestionTool, createTool } from '@anvia/core'
import type { CompletionModel, CompletionResponse } from '@anvia/core/completion'
import { agentEvalTarget } from '@anvia/core/evals'
import { z } from 'zod'

const replies: CompletionResponse[] = [
  { choice: [{ type: 'tool-call', toolCallId: 'approve', toolName: 'record', input: {} }],
    usage: Usage.empty(), rawResponse: null },
  { choice: [{ type: 'tool-call', toolCallId: 'ask', toolName: 'ask', input: {
    questions: [{ id: 'route', text: 'Which queue?',
      choices: [{ label: 'Support', value: 'support' }], allowCustom: false }],
  } }], usage: Usage.empty(), rawResponse: null },
  { choice: [{ type: 'text', text: 'done' }], usage: Usage.empty(), rawResponse: null },
]
const model: CompletionModel = {
  provider: 'offline', modelId: 'interaction-test',
  capabilities: { streaming: false, tools: true, toolChoice: true, outputSchema: false,
    imageInput: false, documentInput: false, reasoning: false },
  async completion() {
    const reply = replies.shift()
    if (!reply) throw new Error('Unexpected extra model call')
    return reply
  },
}
const agent = new Agent({ id: 'eval-interactions', model, tools: [
  createTool({ name: 'record', description: 'Record a synthetic result',
    inputSchema: z.object({}), requiresApproval: true, execute: () => 'recorded' }),
  createQuestionTool({ name: 'ask', description: 'Ask the test operator' }),
] })
const target = agentEvalTarget<string, string, string>({
  agent,
  request: ({ input }) => ({ prompt: input }),
  interactions: {
    maxResponses: 2,
    respond({ interaction, phase }) {
      console.log('response phase', phase)
      if (interaction.type === 'tool-approval') {
        return { type: 'tool-approval', approved: true }
      }
      return { type: 'tool-question', answers: interaction.questions.map((question) => {
        if (question.id !== 'route') throw new Error('Unexpected question')
        return { questionId: question.id, value: 'support' }
      }) }
    },
  },
  output: ({ response }) => response.output,
})
const output = await target('Run the test', { id: 'interactions', input: 'Run the test' })
console.log(output) // done
```

`phase` starts at `1`. `maxResponses` defaults to `10` and must be a positive safe integer.
A missing responder or another suspension after the limit throws `AgentEvalSuspensionError`,
whose `result` contains the pending outcome. A blocked agent throws `AgentRunBlockedError`.
When called inside `runEvalSuite`, target errors are recorded as failed target execution and invalid
judgments rather than ordinary completed outputs. Without `output`, the adapter returns the full
`AgentResponse`; an output selector maps only a completed response.

### Cancellation

`agentEvalTarget` forwards the case `signal` to the initial generation and to approval resumes. If the request also supplies its own `abortSignal`, either signal cancels that target invocation; the first observed abort reason is preserved, including an explicit `null`. Cancellation rejects pending request, interaction responder, and output callbacks without starting later phases. Those callbacks keep their signatures, and application-owned work inside them cannot be forcibly stopped.

Built-in embedding and judge metrics forward the case signal to provider work and retry delays. Providers must cooperate with cancellation, so a settled suite does not by itself prove that a noncooperative operation has stopped.

`gEval` shares one preparation request among concurrent cases of the same metric instance. Cancelling one waiter does not cancel the others; when the last waiter leaves, the pending preparation is cancelled. Setup usage is attached once, to the first case that completes scoring with a valid outcome. Supplying `evaluationSteps` avoids the preparation request. Aggregate evaluation usage is not a complete provider billing ledger.

Keep responders specific to synthetic cases. Automatically approving arbitrary tools in an eval
can execute real side effects; approval never replaces authorization in the handler.
