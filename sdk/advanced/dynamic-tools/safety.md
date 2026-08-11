# Safety

Dynamic selection narrows tool exposure. It does not authorize execution or make a sensitive tool safe.

## Filter before the model sees a tool

Store permission-relevant metadata while building the index:

```ts
const toolIndex = await createToolIndex(
  embeddingModel,
  tools,
  {
    metadata: (tool) => ({
      tenantId: scope.tenant.id,
      plan: scope.tenant.plan,
      role: scope.operator.role,
      risk: tool.name.includes('refund')
        ? 'high'
        : 'normal',
    }),
  },
)
```

Then build the filter from trusted application state:

```ts
const allowedToolFilter = vectorFilter.and(
  vectorFilter.eq('tenantId', tenant.id),
  vectorFilter.eq('plan', tenant.plan),
  vectorFilter.eq('role', operator.role),
)

const agent = new AgentBuilder('support-admin', model)
  .dynamicTools(toolIndex, {
    topK: 6,
    threshold: 0.7,
    filter: allowedToolFilter,
  })
  .build()
```

This prevents ineligible definitions from reaching the model. Do not build filters from model output or unverified request fields.

## Authorize again in the handler

The selected tool must enforce the real operation boundary:

```ts
const requestRefund = createTool({
  name: 'request_refund',
  description: 'Request a refund for an eligible paid order.',
  input: refundInput,
  async execute(args) {
    await auth.requirePermission(
      operator.id,
      'orders:refund',
    )
    await policy.assertRefundAllowed(args)

    return refunds.request({
      ...args,
      idempotencyKey,
      requestedBy: operator.id,
    })
  },
})
```

Catalog metadata can be stale or misconfigured. Handler authorization remains mandatory.

## Keep approvals on sensitive tools

Dynamic tools use the normal tool runtime. Tool approval policies and hook-driven approvals still apply after selection.

Do not remove approval because a high-risk tool was retrieved through a filtered catalog. Selection answers “is this capability relevant?” Approval answers “may this specific action proceed?”

## Scope executable instances

If tools close over user, tenant, transaction, or idempotency state, create them at the trusted request or job boundary and build a matching index for that scope. Do not put request-scoped tools into a mutable global catalog.

For stable catalogs stored in a persistent vector database, ensure the backing `ToolSet` resolves execution against the current authorization context.

## Observe selected tools

Record which definitions were selected, which filters applied, and which tool was executed. Avoid logging private arguments or results by default. Unexpected exposure should be diagnosable even when the model never calls the tool.
