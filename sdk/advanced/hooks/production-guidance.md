# Production guidance

Treat lifecycle, guardrails, approvals, and middleware as separate runtime boundaries. Keep each deterministic, fast, observable, and directly tested.

## Resolve trusted state before the run

Load permissions, feature flags, and environment policy in the route or worker. Close over a small immutable policy object in guardrails, approval requirements, or middleware.

Tool handlers must still load or re-check security-critical state immediately before a private read or side effect. Approval can become stale while a run is suspended.

## Keep callbacks focused

Lifecycle and middleware callbacks are awaited and add latency to the run. Avoid repeated network reads across callbacks. Batch or pre-resolve non-critical state where appropriate.

Lifecycle failures fail the run. Use that only when recording the event is part of correctness. Choose observers for best-effort telemetry and configure their failure behavior deliberately.

## Keep reasons and telemetry safe

Use stable internal reason codes for guardrail blocks and approval requests. They help tests and audit records.

Do not place secrets, credentials, private service responses, or unnecessary model content in a reason, trace, lifecycle record, or public error.

## Preserve original failures

Let provider failures, tool failures, validation errors, maximum-turn errors, and timeouts retain their original types. Use guardrail decisions for intentional policy blocks and approval results for reviewer decisions.

## Test each boundary

Test that lifecycle callbacks receive the expected run, step, tool, finish, and error snapshots.

Test enforced and observe-only guardrail behavior separately.

Test that protected tools never execute before approval, rejected calls do not execute, approved calls use the same parsed input, and authorization is rechecked inside the handler.

Test middleware ordering and both the original and transformed values.

Finally, test stream aborts and partial side effects. Stopping a run must not be treated as rollback.

## Before shipping

- Keep callbacks short and deterministic.
- Resolve request-local policy at the runner boundary.
- Re-check authorization inside tools.
- Use non-sensitive reasons and telemetry.
- Make write tools idempotent or transactionally guarded.
- Handle approval persistence if suspension must survive process loss.
- Observe decisions without logging private payloads.
