# Steer an active run

Queue additional user input with `run.steer()` or `runtime.steer(runId, input, options)`:

```ts anvia-check durable-steering-example
import type { DurableRun } from '@anvia/durable'

export async function steerRun(run: DurableRun, requestId: string) {
  return run.steer(
    { prompt: 'Focus on recovery behavior and preserve the existing API.' },
    { requestId },
  )
}
```

Input accepts exactly one of `prompt` (text or a structured user message) and `messages` (a nonempty
array of user messages). The receipt is `{ id, status: 'queued' }`: it confirms persistence, not model
consumption. Reuse the optional request ID for delivery retries. Equivalent input returns the original
receipt; changed input with that ID conflicts.

The runtime applies input in acceptance order before the first model call, after the current tool
batch, or after an answer before finalization. It does not interrupt in-flight model or tool calls.
Observe `steering_applied` to confirm consumption; `steering_queued` confirms acceptance. Applied events
include the receipt ID, epoch, and boundary turn (zero before the first call). Snapshots retain pending
messages and applied checkpoints, including empty boundaries, so replay cannot change saved requests.

Approvals and recovery blocks accept steering but still need `respond()` or reconciliation. Steering
uses the original model-turn budget and does not guarantee another call if the run fails or is cancelled.
New input is rejected after finalization begins or the run becomes terminal; duplicate IDs can still
acknowledge earlier deliveries. Legacy runs submitted before steering support reject new steering.

Owned and graph runs support steering too. Goal-level edits and messages apply between sessions;
use the current child run handle for mid-session input. See [Goals](/packages/durable/goals).
Steering state counts toward `limits.maxPayloadBytes`.

For remote input, use `client.steer(runId, input, { requestId })`. The
[HTTP handler](/packages/durable/http) authorizes the `steer` action against the stored owner.
Upgrade Core, Durable, Client, and Server together within their declared peer ranges.
