# Human review

**Level:** Application

## Outcome

Pause between model-produced draft data and a consequential action, store an immutable review
record, and resume only after an authorized person approves the exact version.

## When to use it

Use human review for refunds, account changes, publishing, regulated decisions, or low-confidence
extraction. A model asking for confirmation inside a prompt is not an authorization boundary.

## Setup

Install the Anvia packages used by the draft pipeline and `zod` for the review contract. Create
application tables for versioned reviews and audit entries before connecting a real executor.

## Architecture and flow

```text
Anvia draft pipeline -> application review record (pending)
                     -> reviewer UI -> approve/reject exact version
                     -> application executor -> side effect
```

## Draft boundary

```ts
import { z } from "zod";

const Draft = z.object({
  action: z.literal("issue_refund"),
  orderId: z.string(),
  amount: z.number().positive(),
  rationale: z.string(),
});

const { output } = await refundDraftPipeline.run({ input: requestText });
const draft = Draft.parse(output);

const review = await reviews.create({
  tenantId,
  draft,
  draftHash: sha256(JSON.stringify(draft)),
  state: "pending",
  createdBy: actor.id,
});
```

`refundDraftPipeline` is your Anvia `Pipeline` that turns the request into a refund draft.
`pipeline.run()` returns `{ runId, output }`, so validate `output`, not the run result.
`requestText`, `tenantId`, and `actor` come from your authenticated request handler, and `sha256` is
your hashing helper.

## Approval and execution boundaries

```ts
const pending = await reviews.get({ reviewId, tenantId: actor.tenantId });
await authorizeReviewer(actor, pending.tenantId, pending.draft.action);

const review = await reviews.approve({
  reviewId,
  reviewerId: actor.id,
  expectedVersion,
});

await payments.refund({
  orderId: review.draft.orderId,
  amount: review.draft.amount,
  idempotencyKey: `review:${review.id}:${review.version}`,
});
await reviews.markExecuted(review.id, review.version);
```

Authorize the reviewer before recording the approval, so an unauthorized request never changes the
review state. `reviewId` and `expectedVersion` come from the reviewer UI; `reviews`,
`authorizeReviewer`, and `payments` are application-owned. Anvia can produce the typed draft and
offers tool-approval controls for agent runs, but it is not the system of record for durable
business approval.

## When to use `@anvia/durable` instead

When the consequential action is an agent tool call, `@anvia/durable` can persist the pending
approval across process restarts and resume the run after your application calls `run.respond()`.
Durable execution covers agent runs, custom tasks, and their approvals; it does not make an Anvia
`Pipeline` durable. Your application still owns reviewer authorization and any business review
record. See [durable execution](/sdk/advanced/durable-execution) and
[tools, approvals, and recovery](/sdk/advanced/durable-execution/recovery).

## Expected behavior and failure scenarios

Reviewers see the exact draft version. Any edit creates a new version and invalidates the earlier
approval. Rejects never execute. Concurrent approvals use optimistic locking. If execution succeeds
but the final status write fails, the idempotency key makes recovery safe.

Failure cases include stale approval links, a reviewer losing permission, tampered draft data,
duplicate callbacks, and a provider response that fails schema validation.

Run the draft command first and confirm it creates only a pending record. Approve that version from
the reviewer boundary and verify exactly one external effect plus an executed audit entry.

## Security and production adaptations

Require fresh authentication for high-impact actions, enforce separation of duties where needed,
record reviewer identity and timestamps, expire approvals, redact model rationale, and retain an
audit record according to policy. Never put the authorization decision in model-generated text.

## Tests

Test approval of an unchanged version, rejection, stale-version conflict, unauthorized reviewers,
double submission, executor retry, and audit-log completeness. Use a fake executor in unit tests and
a sandbox payment account in integration tests.

## Source and extensions

- Related cookbook approval flow: [`09_studio/03-tool-approval.ts`](https://github.com/anvia-hq/anvia/blob/main/cookbook/09_studio/03-tool-approval.ts)
- Read [tool control](/sdk/advanced/hooks/tool-control) and [lifecycle production guidance](/sdk/advanced/hooks/production-guidance).
- Extend with multi-step approval, reviewer comments, or confidence-based routing.
