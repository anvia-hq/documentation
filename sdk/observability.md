# Observability

Agent observers record runs, generations, tool activity, usage, and trace identity. Lifecycle callbacks support application behavior around those events; observers provide an integration surface with a configurable failure policy.

## Configure a named observer

An observer starts a run and returns an object that receives its terminal result. Keep a closure for correlation instead of relying on a global current run:

```ts anvia-check
import type { AgentObserver } from '@anvia/core/observability'

const telemetry = {
  startRun({ runId }) {
    console.log('run started', runId)
    return {
      end({ status, usage }) {
        console.log('run ended', runId, status, usage.totalTokens)
      },
      error({ status }) {
        console.log('run error', runId, status)
      },
      startGeneration({ turn, modelInfo }) {
        console.log('generation started', runId, turn, modelInfo?.provider)
        return {
          end({ response }) {
            console.log('generation ended', runId, turn, response.usage.totalTokens)
          },
        }
      },
      startTool({ toolName }) {
        console.log('tool started', runId, toolName)
        return {
          end({ skipped }) {
            console.log('tool ended', runId, toolName, skipped)
          },
        }
      },
    }
  },
} satisfies AgentObserver
```

Attach it through the agent's constructor:

```ts
const agent = new Agent({
  id: 'support',
  model,
  observability: {
    observers: { telemetry },
    errorPolicy: 'ignore',
  },
})
```

`errorPolicy: 'ignore'` is the default; observer dispatch failures do not fail the agent. Use `'throw'` when losing telemetry should fail the run. A thrown lifecycle callback fails the run independently of this observer setting. Choose that behavior deliberately.

## Correlate traces

Supply per-run `trace` fields such as `name`, `userId`, `sessionId`, `metadata`, tags, and prompt version. Use stable product IDs and avoid putting private prompts into metadata.

Named observers can return their own `trace: { traceId, observationId }`. Configure `primaryTrace` with an observer name to select the trace exposed on the agent outcome. The console example above does not create an external trace. With several observers, select the integration whose identifiers downstream consumers use.

For an existing trace, pass `traceId` and `parentObservationId` in the run's `trace` options. The integration owns the interpretation of those IDs; keep parent relationships within the same backend. `trace.promptRef` attributes the prompt version used by the agent.

## Handle terminal states and shutdown

Observer `end` receives `completed`, `blocked`, or `suspended`. Suspension ends the current phase while preserving a continuation; it is not a completed answer. Observer `error` receives `failed` or `cancelled`.

Generation observers can receive updates, end, and errors. Tool observers can receive stream events, end, errors, and suspension. See the [public contracts](/packages/core/api-reference) and [runtime lifecycle](/sdk/agents/runtime-lifecycle) for the full event surfaces.

On shutdown, abort and await active runs before closing tracing clients. Otherwise the still-open root observation may be lost. Pipeline observers use their own run and stage contracts; see [pipeline runs and errors](/sdk/pipelines/runs-and-errors) and [parallel jobs](/sdk/advanced/parallel-and-batch/jobs).

## Filter at the telemetry boundary

Observer payloads can contain prompts, history, completion requests, reasoning, tool arguments, results, and raw errors. Select safe fields or apply `@anvia/core/redaction` before sending them to an external backend. Error conversion and output guardrails do not automatically redact telemetry.

Use [Lens](/lens/connect/anvia), [Langfuse](/packages/langfuse), or [OpenTelemetry](/packages/otel) for persistent traces. Evaluation reporters are a separate surface; see [evaluations](/sdk/evaluations) for metric outcomes and target/evaluator usage.
