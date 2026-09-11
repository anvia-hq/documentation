# Approvals in a team

Only the application resolves interactions. Agent messages are content, not authorization: a coordinator or reviewer cannot approve another member's protected tool by messaging it.

## 1. Provide a resolver

Team members use the same `requiresApproval` and question-tool contracts as a single Agent. Pass `resolveInteraction` to answer them while the team runs:

```ts
import type { AgentTeamInteraction } from '@anvia/core/agent'
import type { AgentInteractionResponse } from '@anvia/core/agent/interactions'

// Implement this with your application's authenticated approval/question UI.
declare function askUser(request: AgentTeamInteraction): Promise<AgentInteractionResponse>

const result = await team.generate({
  prompt: 'Investigate and propose changes.',
  resolveInteraction: (request) => askUser(request),
})
```

The resolver receives `teamRunId`, `instanceId`, `runId`, the interaction request, and an abort signal. Other members keep working while an interaction is pending; an instance awaiting interaction releases its concurrency slot.

## 2. Failure behavior

A missing, throwing, or invalid resolver fails the team with `AgentTeamInteractionError` before the protected action executes. Approval denial follows ordinary Agent behavior: the tool is skipped and that member can continue.

## 3. Keep authority in the application

Route every interaction through your own authenticated UI or policy layer. Attribute incoming messages to their sender, treat their content as untrusted data, and never let an agent-to-agent message stand in for user consent. The application decides who may approve; the team runtime only enforces that approval goes through the resolver.

Teams currently live in one process for one execution. Each run creates fresh instances, member conversations are retained only within the execution, and durable persistence or checkpoint/resume is not provided. Studio serves team runs over HTTP with a matching playground view (see [Team runs](/studio/team-runs)); transport adapters have no dedicated team UI.

For comparison with single-agent interactions, see [Interactions and continuations](/sdk/agents/interactions).
