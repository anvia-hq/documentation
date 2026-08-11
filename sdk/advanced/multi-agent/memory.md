# Memory boundaries

Parent and child memory are separate by default. `agent.asTool(...)` runs the child as a stateless prompt and does not create or reuse a child session.

## Prefer stateless specialists

Most specialist tasks should receive everything they need in the tool prompt:

```text
Review this draft for policy risk.

Customer tier: Enterprise
Region: EU
Draft: ...
```

Stateless children are easier to test, retry, trace, and reason about. They cannot silently depend on facts from an earlier delegation.

## Add child memory explicitly

When a child truly needs continuity, create a normal tool whose handler calls the child through `.session(...)`:

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

function createPolicyMemoryTool(input: {
  policyAgent: typeof policyAgent
  threadId: string
  user: User
}) {
  return createTool({
    name: 'ask_policy_memory',
    description: 'Ask the policy agent using its scoped session history.',
    input: z.object({
      prompt: z.string().min(1),
    }),
    output: z.string(),
    async execute({ prompt }) {
      const session = input.policyAgent.session(
        `policy:${input.threadId}`,
        {
          userId: input.user.id,
          metadata: { tenantId: input.user.tenantId },
        },
      )

      const response = await session
        .prompt(prompt)
        .maxTurns(2)
        .send()

      return response.output
    },
  })
}
```

The application—not the coordinator model—owns the child session ID and user or tenant scope.

## Choose the memory owner

| State | Owner |
| --- | --- |
| User conversation and final replies | Coordinator session |
| One-off specialist task | Child prompt, no memory |
| Durable specialist workflow | Explicit child session |
| Live product state | Scoped service or tool |
| Parent-child runtime events | Observability backend |

Do not use memory as the source of truth for permissions or current product state.

## Avoid accidental sharing

Never reuse one child session ID across unrelated users, tenants, or parent conversations. Include stable product-owned scope and configure the memory store to enforce it.

Do not copy the full parent transcript into every child session. Pass only the task and evidence the specialist needs; otherwise the specialist boundary provides little isolation and consumes unnecessary context.

## Know the tradeoff

Durable child memory adds storage, retention, compaction, privacy, and retry concerns. Add it only when a specialist must continue its own conversation across calls—not merely because the parent already has memory.
