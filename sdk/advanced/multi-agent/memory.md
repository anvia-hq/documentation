# Memory boundaries

Parent and child memory are separate. `agent.asTool()` always runs the child through a stateless `generate(prompt)` call.

## 1. Prefer stateless specialists

Pass a focused, self-contained task:

```text
Review this draft for policy risk.

Customer tier: Enterprise
Region: EU
Draft: ...
```

Stateless children are easier to test, retry, trace, and reason about. They cannot silently depend on an earlier delegation.

## 2. Wrap an explicit child session

When a child genuinely needs continuity, create a normal tool whose handler owns the session scope:

```ts
import { createTool } from '@anvia/core';
import { z } from 'zod';
function createPolicyMemoryTool(input: {
    threadId: string;
    user: User;
}) {
    return createTool({
        name: 'ask_policy_memory',
        description: 'Ask the policy specialist using scoped history.',
        inputSchema: z.object({
            prompt: z.string().min(1),
        }),
        outputSchema: z.string(),
        async execute({ prompt }) {
            const session = { sessionId: `policy:${input.user.tenantId}:${input.threadId}`, userId: input.user.id, metadata: { tenantId: input.user.tenantId } };
            const response = await policyAgent.generate({
                prompt: prompt,
                maxTurns: 2,
                session: session
            });
            if (response.status === 'approval_required') {
                throw new Error('A child session used as a tool cannot suspend for approval.');
            }
            return response.output;
        },
    });
}
```

The application—not the coordinator model—owns the child session ID, user ID, and tenant scope.

## 3. Assign one owner to each state

The coordinator session owns the user conversation and final replies. A stateless child prompt owns one specialist task. An explicit child session owns durable specialist continuity.

Application services own live product state and permissions. Observability storage owns parent-child runtime events. Memory must not replace any of those systems.

## 4. Avoid accidental sharing

Never reuse one child session across unrelated users, tenants, or parent threads. Enforce scope in the memory store as well as the session ID.

Do not copy the full parent transcript into every child. Pass the task and evidence the specialist needs; otherwise the boundary loses isolation and consumes unnecessary context.

Durable child memory adds retention, compaction, privacy, and retry concerns. Add it only when the child must continue its own conversation across calls.

Next, design [coordination](/sdk/advanced/multi-agent/coordination).
