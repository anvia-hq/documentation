# Hooks and run control

Hooks let application code observe and control an agent while it runs. They can cancel a run, skip a tool, request approval, or react to lifecycle events without putting policy into the prompt.

## Explore hooks

| Page | Learn how to |
| --- | --- |
| [Create a hook](/sdk/advanced/hooks/create) | Define a hook and attach it globally or to one request. |
| [Hook points](/sdk/advanced/hooks/hook-points) | Choose the correct run, turn, completion, or tool event. |
| [Cancellation](/sdk/advanced/hooks/cancellation) | Stop a run intentionally and handle the resulting error. |
| [Tool control](/sdk/advanced/hooks/tool-control) | Run, skip, cancel, or request approval for a tool call. |
| [Hooks and middleware](/sdk/advanced/hooks/middleware) | Choose control flow or data transformation. |
| [Production guidance](/sdk/advanced/hooks/production-guidance) | Keep policies fast, testable, and observable. |

## A minimal hook

```ts
import { AgentBuilder, createHook } from '@anvia/core'

const policyHook = createHook({
  onRunStart({ maxTurns, run }) {
    if (maxTurns > 8) {
      return run.cancel('This workflow allows at most 8 turns.')
    }
  },
  onToolCall({ toolName, tool }) {
    if (toolName === 'delete_account') {
      return tool.requestApproval({
        reason: 'Deleting an account requires reviewer approval.',
      })
    }
  },
})

const agent = new AgentBuilder('support', model)
  .hook(policyHook)
  .build()
```

Returning nothing continues normally. Control methods return explicit actions that the runtime applies after the callback.

## What hooks should own

Hooks are useful for:

- request and environment policy
- run limits and cancellation
- tool gating and approval
- audit annotations and lifecycle signals
- request-local decisions that belong beside the runtime

Hooks are not the final authorization boundary for tools. A tool handler must still validate permissions and business rules immediately before reading private data or performing a side effect.

## Hooks are not React hooks

These are server-side Anvia runtime hooks created with `createHook(...)`. They are unrelated to React hooks such as `useChat(...)`.
