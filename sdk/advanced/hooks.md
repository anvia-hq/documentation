# Lifecycle and run control

The v1 public API separates passive lifecycle callbacks from the features that can change execution:

```text
Lifecycle   -> observe run, step, tool, finish, and error events
Guardrails  -> allow, block, or rewrite model input and output
Approval    -> suspend before a protected tool executes
Middleware  -> transform completion and tool data
Stream      -> expose progress and stop consumption
```

`createHook()` and the agent `hook` option are not public v1 APIs. Use the focused surface that matches the policy.

## 1. Observe a run

```ts
import { Agent } from '@anvia/core'
import type { AgentLifecycle } from '@anvia/core'

const lifecycle: AgentLifecycle = {
  onStart({ runId, maxTurns }) {
    audit.info('agent.started', { runId, maxTurns })
  },
  onToolFinish({ runId, toolName, success, durationMs }) {
    audit.info('agent.tool.finished', {
      runId,
      toolName,
      success,
      durationMs,
    })
  },
  onError({ runId, error }) {
    audit.error('agent.failed', { runId, error })
  },
}

const agent = new Agent({
  id: 'support',
  model,
  lifecycle,
})
```

Lifecycle callbacks receive snapshots and return no control action. If a lifecycle callback throws, the run fails, so telemetry that must never affect execution belongs in an observer. See the [agent runtime lifecycle](/sdk/agents/runtime-lifecycle) for how these surfaces fit together.

## 2. Apply run control deliberately

Use guardrails to block or rewrite model-facing input and output; see [Stable behavior](/sdk/agents/stable-behavior). Use tool `requiresApproval` for human or policy approval before a side effect. Use an authenticated tool handler as the final authorization boundary.

Use client abort and iterator closure to stop a normal stream. Cancellation cannot undo a tool call or write that already completed.

## 3. Continue through the section

- [Configure lifecycle callbacks](/sdk/advanced/hooks/create)
- [Choose lifecycle events](/sdk/advanced/hooks/hook-points)
- [Understand cancellation](/sdk/advanced/hooks/cancellation)
- [Protect tools with approval](/sdk/advanced/hooks/tool-control)
- [Choose lifecycle or middleware](/sdk/advanced/hooks/middleware)
- [Apply production guidance](/sdk/advanced/hooks/production-guidance)
