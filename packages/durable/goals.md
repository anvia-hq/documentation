# Durable goals

`defineGoal()` pursues an objective across bounded agent sessions. Register the definition in
`DurableRuntime.open({ tasks })`, then call `submitGoal()`. A required application assessor decides
whether verified work is complete, blocked, or needs another session. A model's final answer alone
does not complete the goal.

## Define the assessor and runtime

This complete factory accepts your agent and a read-only acceptance check. The check must inspect
the actual artifacts or outcomes named by the criteria and honor its abort signal.

```ts anvia-check durable-goal-example
import type { Agent } from '@anvia/core/agent'
import { defineGoal, DurableRuntime } from '@anvia/durable'
import { SqliteDurableStore } from '@anvia/durable/sqlite'

type Verification = {
  passed: boolean
  blocked: boolean
  artifactHash: string
  summary: string
  nextAction: string
  evidence: string[]
}

export async function openGoalRuntime(
  builder: Agent<unknown>,
  databasePath: string,
  verifyProject: (criteria: readonly string[], signal: AbortSignal) => Promise<Verification>,
) {
  const definition = defineGoal({
    name: 'verified-build',
    version: 1,
    agentId: builder.id,
    rounds: 'continue',
    assess: async ({ acceptanceCriteria }, signal) => {
      const check = await verifyProject(acceptanceCriteria, signal)
      return {
        status: check.passed ? 'complete' : check.blocked ? 'blocked' : 'continue',
        progressKey: check.artifactHash,
        summary: check.summary,
        next: check.nextAction,
        evidence: check.evidence,
      }
    },
  })
  const runtime = await DurableRuntime.open({
    store: new SqliteDurableStore(databasePath),
    agents: [{ agent: builder, version: 'builder-v1' }],
    tasks: [definition],
  })
  await runtime.resume()
  return { runtime, definition }
}
```

```ts
const goal = await runtime.submitGoal(definition, {
  sessionId: 'project-42',
  requestId: 'implement-search',
  objective: 'Implement search',
  acceptanceCriteria: ['Search acceptance tests pass', 'Existing tests pass'],
  limits: {
    maxSessions: 20,
    maxTotalModelTurns: 200,
    maxConsecutiveNoProgressSessions: 3,
    maxTotalTokens: 200_000,
  },
})
const result = await goal.result()
console.log(result.handoff.evidence)
// At application shutdown:
await runtime.close()
```

The assessor receives `agentId`, the effective objective and criteria, `previous` handoff, and
`session` (`runId`, `status`, `output`, `messages`, `roundMessages`, `modelTurns`, and `usage`).
`status` is `response` or `exhausted`. Its `GoalDecision` has `status`, nonblank `summary` and
`progressKey`, `next`, `evidence`, and optional `context` for the next session's handoff.
Choose a verified progress marker, such as an artifact hash; a new run ID every round defeats
the no-progress check.

Assessment is a journaled, repeatable task effect. Committed decisions replay without another
assessment; a crash before commit can repeat it. Failed or invalid assessment needs explicit
repair and retry. Work or model calls hidden inside the assessor are outside the session budget
and agent recovery guarantees.

## Agents and continuing rounds

An optional submission `agentId` overrides the definition's default. One of them is required,
and the agent must be registered before submission. The effective ID is captured in the checkpoint;
changing the default does not redirect an existing goal. Restore that registration after restart.
The application must authorize the selected agent, including for submissions through task APIs.

`rounds: 'fresh'` is the default: each session starts from the objective and verified handoff.
`rounds: 'continue'` preserves the previous session's conversation, including partial work when its
turn limit was reached. `session.messages` is the whole conversation; `session.roundMessages`
contains only the current round, starting with its prompt. Configure registration
[compaction](/packages/durable/compaction) for growing conversations.

## Budgets and pauses

| Limit | Behavior |
| --- | --- |
| `maxSessions` | Required, 1–999; the ownership tree includes the goal itself. |
| `maxTotalModelTurns` | Required positive integer; cumulative main-model operations, including failed operations. Recovery and approvals do not replenish it. |
| `maxConsecutiveNoProgressSessions` | Required positive integer; consecutive unchanged `progressKey` assessments after the first establishes a baseline. |
| `maxTotalTokens` | Optional positive integer; checks committed session usage, including compaction, before admitting another session. |
| `deadline` | Optional ISO UTC timestamp; admission deadline, including after restart. |

The agent's `maxTurns` limits each session; it counts continuations after the initial model call.
The goal caps each child's total model turns by the remaining goal budget. Provider retries reuse
one operation, and compaction calls do not consume main-model turns. Token limits can be exceeded
by an active session; deadlines do not interrupt it or its approval waits. These are admission
controls, not exact provider-billing caps.

Budget exhaustion, no progress, a `blocked` assessment, an ordinary session failure, or a requested
pause puts the goal in a persisted signal wait. Inspect `checkpoint.pauseReason`. Approvals and
uncertain tools still require the child run's `respond()` or `resolveTool()`; the controller never
skips them by starting another session. `goal.result()` waits through pauses; aborting the wait
only detaches the caller.

```ts
const { task } = await goal.snapshot()
if (task.wait?.type === 'signal') {
  await goal.signal(task.wait.name, 'operator-resume-42', {
    feedback: 'The dependency is available; continue.',
  })
}
```

Resume uses the exact exposed signal name and a delivery request ID. Optional `limits` replaces
the entire limit configuration. Cumulative usage and session counts remain; the stall counter
resets. Invalid resume input consumes the signal name and exposes a new one for correction.

## Pause, edit, and message

```ts
import { goalControlSignal } from '@anvia/durable'

const { task } = await goal.snapshot()
await goal.signal(goalControlSignal(task, 'pause'), 'pause-7', {})
await goal.signal(goalControlSignal(task, 'edit'), 'edit-7', {
  acceptanceCriteria: ['Search acceptance tests pass', 'Search uses the cached index'],
})
await goal.signal(goalControlSignal(task, 'message'), 'message-7', {
  text: 'Reuse the existing index instead of rebuilding it.',
})
```

Controls are read before admitting the next session. A pause lets the current session and assessment
finish. Edits affect later sessions and assessments; a message targets the next session. Edits and
messages queued while paused apply on resume. Use `goalPauseSchema`, `goalEditSchema`,
`goalMessageSchema`, and `goalResumeSchema` to validate deliveries; malformed control values are
skipped but their names remain used.

Concurrent senders can select the same name. On `DurableConflictError`, read a fresh snapshot and
recompute it; retain the delivery request ID. A delivery already accepted in that family needs no
retry. An interrupted session spawn can deliver a message again to the following session, so do
not treat it as an exactly-once external effect. To send input within the current session, use
[run steering](/packages/durable/steering).

## Recovery and remote access

Reacquire the task with `runtime.getTask(id)`, restore the original definition version and compatible
agent registrations, then call `runtime.resume()`. `defineGoal()` provides no migration callback;
use a new definition identity for incompatible policy changes. `goal.graph()` and `goal.stream()`
expose the ownership tree, and `goal.cancel()` cancels it.

Goals use the existing [task HTTP routes](/packages/durable/http): submit the registered name/version
with `agentId`, objective, criteria, and limits inside `input`. There are no separate goal routes or
Studio goal UI. Task submission authorization includes the effective agent, including definition defaults.
