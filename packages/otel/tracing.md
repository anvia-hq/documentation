# Tracing

Use one adapter for Agent internals and another for Pipeline orchestration. Matching `primaryTrace`
names connect both layers into one OpenTelemetry trace:

```ts
import { Agent, type CompletionModel } from '@anvia/core'
import { Pipeline } from '@anvia/core/pipeline'
import { createOtelObserver, createOtelPipelineObserver } from '@anvia/otel'
import { z } from 'zod'

declare const model: CompletionModel

const agent = new Agent({
  id: 'support',
  model,
  observability: {
    observers: {
      otel: createOtelObserver({ serviceName: 'support-api', captureMode: 'safe' }),
    },
    primaryTrace: 'otel',
  },
})

const pipeline = new Pipeline({
  id: 'support-flow',
  inputSchema: z.string(),
  observability: {
    observers: {
      otel: createOtelPipelineObserver({
        serviceName: 'support-api',
        captureMode: 'safe',
      }),
    },
    primaryTrace: 'otel',
  },
}).agent({
  id: 'answer',
  agent,
  suspension: 'reject',
  request: ({ input }) => ({ prompt: input }),
})

const result = await pipeline.run({
  input: 'How long are refunds available?',
  trace: { sessionId: 'support-session' },
})

console.log(result.trace?.traceId)
```

`createOtelPipelineObserver()` emits a Pipeline root span and nested spans for composed, parallel,
Agent, extraction, and custom stages. `createOtelObserver()` emits the Agent run, model generation,
tool, child-agent, and error spans below an Agent stage.

If the Pipeline and Agent `primaryTrace` names differ, Core does not propagate the stage parent and
the Agent observer starts its own trace. The name is application-defined; use the same key for
observers that belong to the same backend.

Both adapters use a supplied `tracer` or the active global tracer provider. The package does not
initialize exporters or own provider lifecycle. Configure and start the application's OpenTelemetry
SDK before invoking observed Agents or Pipelines.
