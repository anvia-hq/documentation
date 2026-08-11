# Production checklist

Verify ownership, limits, privacy, and failure behavior before shipping a multi-agent flow.

## Agent boundaries

- Give every coordinator and child a stable ID.
- Keep child instructions narrow and role-specific.
- Give specialist tools distinct names and descriptions.
- Pass focused tasks instead of the full parent transcript.
- Keep children stateless unless durable child memory is required.

## Runtime limits

- Set a parent turn limit.
- Set smaller `maxTurns` values on every child tool.
- Avoid recursive or cyclic delegation.
- Decide which specialist failures are optional and which fail closed.
- Account for the combined model usage and latency.

## Product ownership

- Let the coordinator own final user-facing wording.
- Persist one product result from the parent runner.
- Keep side-effect permissions and validation inside tool handlers.
- Make writes idempotent or auditable.
- Never use agent memory as the source of truth for live product state.

## Events and privacy

- Group child events under the parent run and tool call.
- Project nested activity into reviewed client-safe statuses.
- Do not expose raw reasoning, tool arguments, or private tool results by default.
- Apply retention and redaction policy to traces and event records.
- Make parent and child failures distinguishable in internal operations views.

## Test the system

Cover at least these paths:

| Scenario | Verify |
| --- | --- |
| No specialist is needed | Coordinator answers without unnecessary delegation. |
| One specialist succeeds | Its findings influence one final parent response. |
| Optional specialist fails | Parent discloses the missing evidence and continues safely. |
| Required specialist fails | Run stops or enters the intended review path. |
| Specialists disagree | Parent communicates uncertainty instead of hiding it. |
| Child requests a forbidden action | Tool authorization blocks it independently. |
| Client consumes nested events | Private event data remains server-side. |

Run evaluations against the single-agent alternative as well. Multi-agent architecture should earn its additional complexity with measurable quality, control, or isolation.
