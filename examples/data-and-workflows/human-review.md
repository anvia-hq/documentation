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
const Draft = z.object({
    action: z.literal("issue_refund"),
    orderId: z.string(),
    amount: z.number().positive(),
    rationale: z.string(),
});
const draft = Draft.parse(await refundDraftPipeline.run({
    input: requestText
}));
const review = await reviews.create({
    tenantId,
    draft,
    draftHash: sha256(JSON.stringify(draft)),
    state: "pending",
    createdBy: actor.id,
});

```

## Approval and execution boundaries

```ts
const review = await reviews.approve({
  reviewId,
  reviewerId: actor.id,
  expectedVersion,
});

await authorizeReviewer(actor, review.tenantId, review.draft.action);
await payments.refund({
  orderId: review.draft.orderId,
  amount: review.draft.amount,
  idempotencyKey: `review:${review.id}:${review.version}`,
});
await reviews.markExecuted(review.id, review.version);
```

`reviews`, `authorizeReviewer`, hashing, and `payments` are application-owned. Anvia can produce the
typed draft and offers tool-approval controls for interactive runs, but it is not the system of
record for durable business approval.

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

- Related cookbook approval flow: [`09_studio/03-tool-approval.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/09_studio/03-tool-approval.ts)
- Read [tool control](/sdk/advanced/hooks/tool-control) and [lifecycle production guidance](/sdk/advanced/hooks/production-guidance).
- Extend with multi-step approval, reviewer comments, or confidence-based routing.
