# Durable conversation compaction

Configure `compaction` on a durable agent registration. Durable session history replaces `Agent.memory`,
so configuring an agent memory store remains unsupported. Compaction reduces model context while keeping
the canonical transcript and journal intact.

```ts anvia-check durable-compaction-example
import type { Agent } from '@anvia/core/agent'
import { createSummaryMemoryCompactor } from '@anvia/core/memory'
import type { DurableAgentRegistration } from '@anvia/durable'

export function compactingRegistration(agent: Agent<unknown>): DurableAgentRegistration {
  return {
    agent,
    version: 'compacting-agent-v1',
    compaction: {
      trigger: { afterTokens: 32_000 },
      retention: { recentTurns: 3, recentToolTurns: 0 },
      compactor: createSummaryMemoryCompactor({
        model: agent.model,
        maxTokens: 2_000,
        temperature: null,
        retries: false,
      }),
    },
  }
}
```

Pass the returned registration in `DurableRuntime.open({ agents })`. `temperature: null` omits the
parameter for summary models that reject it; omission or `undefined` keeps the compactor's default
temperature of zero. Main-agent sampling settings do not control the summary request.

## Triggers and retention

`trigger.afterTokens` is a positive integer. `recentTurns` and `recentToolTurns` are nonnegative
integers, each defaulting to one. Between session runs, retain complete user-led turns. Before model
calls in active tool loops and approval continuations, retain complete tool rounds: parallel calls
stay with all their results, and the active user request stays verbatim. Zero `recentToolTurns`
allows summarizing even the latest large tool result. A skipped preparation is checkpointed too.

The default counter is `estimateMemoryTokens`; an optional `tokenCounter` must be deterministic,
return a nonnegative safe integer, and preserve its semantics after restart. The threshold covers
the projected history and incoming prompt, not instructions, tool schemas, or output reservations.
Retained messages and large summaries can still exceed a model window. There is no manual durable
compaction API or automatic retry of arbitrary context-limit errors. Static graph runs are not compacted.

## Persistence and recovery

`run.history` and `outcome.messages` retain canonical messages. `contextCheckpoint` stores a summary
and the number of canonical messages it covers; `run.input` is the initial model-facing projection.
Context operations capture subsequent per-call projections. A queued run selects its predecessor's
checkpoint when it starts; failed or cancelled runs do not advance the next run's checkpoint.

Completed context operations replay their exact projection and committed usage without another
summary or repeated tool execution. A started but uncommitted preparation is recomputed after a
crash. Its summary can differ and incur another provider charge. Successful summary usage is added
once at commit, but uncommitted provider usage cannot be reconstructed.

`compaction_started` and `compaction_completed` are persisted events. Completion carries
`MemoryCompactionInfo`. Summary calls do not consume the main-model turn budget. Registration
`modelRetry` also bounds summary errors and invalid summaries; counter, quota, and journal errors
are not provider retries. An explicit run retry resets unfinished retry budgets.

Restore the same compactor and counter implementations, and bump the registration version when
either changes. Compactors must honor cancellation and be safe to repeat. Removing compaction
from a future registration sends full canonical history again. Compaction does not prune storage
or bypass payload limits; see [Operations](/packages/durable/operations).
