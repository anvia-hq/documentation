# Does Anvia handle authentication and authorization?

No. Anvia consumes the identity and permissions established by the application; it does not replace the application's authentication or authorization layer.

## Authenticate before the runtime

An HTTP route should verify the caller before it loads a session, accepts attachments, starts an agent, or opens a resumable stream. A session ID, user ID, trace ID, or resume cursor is an identifier—not proof of access.

## Authorize inside every tool

A tool schema confirms that model-produced arguments have the expected shape. It cannot determine whether the current caller may read an account, refund an order, send a message, or change a record.

Capture trusted identity in the application service or tool factory and make the permission check there:

```ts
function createRefundOrderTool(
  actor: AuthenticatedActor,
  operationId: string,
) {
  return createTool({
    name: 'refund_order',
    description: 'Refund an order the current user may manage.',
    input: refundSchema,
    execute: async ({ orderId }) => {
      await orders.assertCanRefund(actor.userId, orderId)
      return orders.refund({
        orderId,
        requestedBy: actor.userId,
        idempotencyKey: `refund:${operationId}:${orderId}`,
      })
    },
  })
}
```

The exact context shape belongs to the application. Do not let the model declare its own user, role, tenant, or permission scope.

The application should create `operationId` and keep it stable across retries; it must not come from model-generated arguments.

## Keep boundaries independent

- Memory scope separates conversation histories; it is not authorization.
- Retrieval filters narrow search; they do not establish tenant access.
- Tool approval confirms a proposed action; it does not authenticate the approver.
- Studio is a trusted development surface; `protectShell` is not authentication.
- Lens project credentials protect telemetry ingestion, not product routes.

See [tool security](/sdk/tools/security), [memory sessions](/sdk/memory/sessions), and [Studio security boundaries](/studio/configure/security-boundaries).
