# Production checklist

Verify ownership, limits, privacy, and failure behavior before shipping a multi-agent workflow.

## Agent boundaries

- Give every coordinator and child a stable ID.
- Keep child instructions narrow and role-specific.
- Give specialist tools distinct names and descriptions.
- Pass focused tasks instead of the full parent transcript.
- Keep children stateless unless durable child continuity is required.
- Do not place approval-requiring tools inside an `asTool()` child.

## Runtime limits

- Set a parent turn limit.
- Set smaller `maxTurns` values on child tools.
- Avoid recursive or cyclic delegation.
- Decide which specialist failures are optional and which require review.
- Account for combined model usage and latency.

## Product ownership

- Let the coordinator own final user-facing wording.
- Persist one product result from the parent runner.
- Keep permissions and validation inside every tool handler.
- Make writes idempotent or auditable.
- Never use agent memory as the source of truth for live product state.

## Events and privacy

- Group child events under the parent turn and tool call.
- Project nested activity into reviewed client-safe statuses.
- Do not expose raw reasoning, prompts, tool arguments, or private results by default.
- Apply retention and redaction policy to traces and event records.
- Distinguish parent and child failures in operator views.

## Test the system

Verify that the coordinator avoids unnecessary delegation when no specialist is needed.

Verify that a successful specialist materially influences one final coordinator response.

Verify that optional failure is disclosed safely and required failure enters the intended review path.

Verify that specialist disagreement remains visible rather than being silently erased.

Verify that child permissions block forbidden actions independently and that private nested event data remains server-side.

Run the same evaluation set against the single-agent alternative. Multi-agent architecture should earn its extra complexity with measurable quality, control, or isolation.
