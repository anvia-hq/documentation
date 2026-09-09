# Agent teams

`AgentTeam` coordinates ordinary `Agent` definitions as a collaborating team. The coordinator decides when to spawn members, each spawned instance gets its own conversation and inbox, and members message each other or report outcomes back to their parent while the run is in flight.

Use an agent team when membership is dynamic: the coordinator should choose how many specialists to start, when to start them, and whether to recurse into subproblems. If the same specialists always run in a known order, use [Agent as a tool](/sdk/advanced/multi-agent/agent-as-tool) or a [Pipeline](/sdk/pipelines) instead.

Availability: `AgentTeam` ships from `@anvia/core/agent` in the next minor release of `@anvia/core` (it is merged on main behind pending changesets; verify your installed version). Studio exposes live team runs over HTTP; see [Team runs](/studio/team-runs).

## 1. Build a team

Members are normal agents. The team adds the coordination tools; each member keeps only its own configured tools.

```ts
import { Agent, AgentTeam } from '@anvia/core/agent'

const researcher = new Agent({
  id: 'researcher',
  model,
  description: 'Research a specific question and report evidence.',
  instructions: 'Ask your parent for clarification when needed.',
  tools: [readFileTool, searchTool],
})

const reviewer = new Agent({
  id: 'reviewer',
  model,
  description: 'Review findings for errors and unsupported claims.',
  tools: [readFileTool],
})

const team = new AgentTeam({
  id: 'research-team',
  model,
  instructions: [
    'Delegate research to researcher instances.',
    'Send their findings to a reviewer and incorporate its feedback.',
    'Answer the user after the work is complete.',
  ].join('\n'),
  members: [researcher, reviewer],
  limits: {
    maxDepth: 3,
    maxConcurrentAgents: 4,
    maxAgentInstances: 12,
    maxTotalTurns: 100,
    maxBufferedEvents: 1024,
  },
})

const result = await team.generate({ prompt: 'Investigate the proposed architecture.' })
if (result.type === 'response') console.log(result.output)
console.log(result.teamRunId, result.usage, result.members)
```

The coordinator accepts normal `Agent` configuration, including `outputSchema` (it sets the team's output type), context, guardrails, middleware, and lifecycle callbacks. Run-level options apply to the coordinator; the abort signal, interaction resolver, and limits apply to the whole execution.

## 2. Coordination tools the runtime provides

| Tool | Available to | Input |
| --- | --- | --- |
| `spawn_<member.id>` | Coordinator and permitted parents | `{ prompt, name? }` |
| `send_message` | All instances | `{ to, content, replyTo? }` |
| `wait_for_agent` | All instances | `{ instanceId?, timeoutMs? }` |
| `list_agents` | All instances | `{}` |
| `cancel_agent` | Instances with spawn permissions | `{ instanceId, reason? }` |

Spawning returns an `instanceId` immediately. A definition keeps its `agentId` across instances; every assignment or resumed interaction has a distinct `runId`. Member IDs must be 1–58 letters, digits, underscores, or hyphens so generated spawn tool names are valid, and configured tools must not collide with the reserved coordination names.

## 3. Instances and identity

One `AgentTeam` definition can produce many runs. Each `generate()` or `stream()` call creates fresh instances that live for that execution only. A member instance is one conversation: sending it a message while it is idle starts a follow-up run with its retained history.

The final outcome extends the ordinary Agent outcome with `teamRunId`, aggregate `usage` across every member, and a `members` array summarizing every instance, including descendants, with `parentInstanceId`, `depth`, status, usage, and outcome.

## 4. Bound the execution

The limits above are the defaults. `maxDepth` counts the coordinator as depth 0. Concurrency and instance limits include the coordinator; the instance limit counts every instance created during the execution, including completed and cancelled ones. The turn budget covers all instances and follow-ups. All budgets are shared across the whole tree; spawning does not reset them.

Reaching the turn budget fails the team. Reaching the instance or depth limit rejects the spawn tool call so the parent can keep working with existing members.

## 5. Continue through the section

- [Message and wait between agents](/sdk/advanced/multi-agent/agent-teams/communication)
- [Grow a hierarchy with spawning](/sdk/advanced/multi-agent/agent-teams/hierarchy)
- [Stream, steer, and cancel a team](/sdk/advanced/multi-agent/agent-teams/streaming)
- [Resolve approvals and questions](/sdk/advanced/multi-agent/agent-teams/approvals)
