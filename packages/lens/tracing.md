# Tracing

`LensClient` owns isolated trace and log providers for the Lens ingestion endpoint. Its Agent and
Pipeline observers record application activity without registering global OpenTelemetry providers.

```ts
import { Agent, type CompletionModel } from '@anvia/core'
import { Pipeline } from '@anvia/core/pipeline'
import { LensClient } from '@anvia/lens'
import { z } from 'zod'

declare const model: CompletionModel

const lens = new LensClient({
  serviceName: 'support-api',
  environment: 'production',
  release: process.env.APP_RELEASE,
})
const agentTracing = lens.observer({ captureMode: 'safe' })
const pipelineTracing = lens.pipelineObserver({ captureMode: 'safe' })
```

Attach `agentTracing` through an Agent's named `observers` map and `pipelineTracing` through a
Pipeline's constructor:

```ts
const agent = new Agent({
  id: 'support',
  model,
  observability: {
    observers: { lens: agentTracing },
    primaryTrace: 'lens',
  },
})

const pipeline = new Pipeline({
  id: 'support-flow',
  inputSchema: z.string(),
  observability: {
    observers: { lens: pipelineTracing },
    primaryTrace: 'lens',
  },
}).agent({
  id: 'answer',
  agent,
  suspension: 'reject',
  request: ({ input }) => ({ prompt: input }),
})
```

Matching `primaryTrace` names produce one trace with Pipeline run and stage spans above the Agent's
run, generation, tool, child-agent, error, trace, and usage information. Different names leave the
Agent trace unparented.

Full capture adds Agent payloads plus Pipeline and stage inputs and outputs. Enable it only after a
privacy review.

Call `lens.flush()` at a short-lived delivery boundary and `lens.close()` during final cleanup.
