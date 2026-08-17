# Configure lifecycle

An `AgentLifecycle` observes important runtime boundaries without changing their data or control flow.

## 1. Define the callbacks you need

```ts
import type { AgentLifecycle } from '@anvia/core'

const supportLifecycle: AgentLifecycle = {
  async onStart({ runId, input, history, maxTurns }) {
    await runs.started({
      runId,
      inputRole: input.role,
      historyLength: history.length,
      maxTurns,
    })
  },

  async onFinish(event) {
    if (event.status !== 'completed') {
      await runs.blocked({ runId: event.runId, stage: event.stage })
      return
    }
    await runs.completed({
      runId: event.runId,
      outputLength: event.output.length,
      totalTokens: event.usage.totalTokens,
    })
  },

  async onError({ runId, error, usage }) {
    await runs.failed({ runId, error, usage })
  },
}
```

Add only the callbacks the integration needs. Avoid logging the full input, history, output, or tool payload unless the product has explicitly approved that data collection.

## 2. Attach stable lifecycle behavior

```ts
const agent = new Agent({
  id: 'support',
  model,
  lifecycle: supportLifecycle,
})
```

The agent lifecycle runs for every `generate()` and `stream()` call, including calls through a memory session.

## 3. Attach request-local lifecycle behavior

Both generation modes accept a lifecycle in their run options:

```ts
const result = await agent.generate({
    prompt: message,
    lifecycle: {
        onFinish({ runId, usage }) {
            requestMetrics.record({ runId, usage });
        },
    }
})
```

When both scopes are present, Anvia composes the agent lifecycle first and the run lifecycle second. Each callback receives an isolated snapshot.

## 4. Know the failure behavior

Lifecycle callbacks are awaited. If one throws, the agent run fails and proceeds through error cleanup. Use this when recording the lifecycle event is required for correctness.

Use an observer with non-failing behavior for best-effort telemetry that should not stop the run. The [agent runtime lifecycle](/sdk/agents/runtime-lifecycle) explains the distinction.

Next, choose the right [lifecycle event](/sdk/advanced/hooks/hook-points).
