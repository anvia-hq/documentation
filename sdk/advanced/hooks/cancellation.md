# Cancellation

V1 uses different mechanisms for policy blocking, stream cancellation, approval rejection, and runtime failure. Keep them distinct so callers can handle each outcome correctly.

## 1. Block model input with a guardrail

Use an enforcing input guardrail when application policy should stop the request before a provider call:

```ts
import {
  defineGuardrailPolicy,
  defineInputGuardrail,
} from '@anvia/core'

const environmentPolicy = defineGuardrailPolicy({
  id: 'environment-policy',
  input: [
    defineInputGuardrail({
      id: 'agent-runs-enabled',
      check(_context, actions) {
        if (deployment.agentRunsDisabled) {
          return actions.block({
            reason: 'agent_runs_disabled',
            message: 'Agent requests are temporarily unavailable.',
          })
        }

        return actions.allow()
      },
    }),
  ],
})

const agent = new Agent({
  id: 'support',
  model,
  guardrails: environmentPolicy,
})
```

An enforced input block completes with the safe block message and records guardrail decisions; it does not masquerade as a provider failure.

## 2. Stop a normal stream

When a browser aborts a normal `createClientStreamResponse()` response, the server closes the event iterator. Closing an active `AgentStream` cancels its run.

```ts
const controller = new AbortController()

fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify(requestBody),
  signal: controller.signal,
})

controller.abort()
```

With `useChat`, call `chat.stop()`. See [Streaming errors and cancellation](/sdk/streaming/errors-and-cancellation).

## 3. Reject a pending tool approval

```ts
const pending = await agent.generate({
    prompt: message
})

if (pending.status === 'suspended' && pending.interaction.type === 'tool-approval') {
  const result = await agent.generate({
    continuation: pending.continuation,
    response: {
      type: 'tool-approval',
      approved: false,
      reason: 'The reviewer rejected this operation.',
    },
  })
}
```

Rejection prevents that protected tool call from executing and lets the runtime continue with the rejection result.

## 4. Understand the limit

Stopping a run prevents future model turns and tool calls. It cannot undo completed writes or external side effects. Write tools still need authorization, idempotency, transactions where appropriate, and audit records.

Use original error types for provider, tool, validation, and timeout failures. Do not relabel operational failures as policy cancellation.

Next, configure [tool approval](/sdk/advanced/hooks/tool-control).
