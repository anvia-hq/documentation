# Dynamic tool safety

Dynamic selection narrows model exposure. It does not authorize execution or make a sensitive tool safe.

## 1. Filter before exposure

Create metadata from trusted application data and apply the filter when building the index:

```ts
import { createToolIndex } from '@anvia/core/tool';
import { vectorFilter } from '@anvia/core/vector-store';
const allowedFilter = vectorFilter.and(vectorFilter.eq('tenantId', scope.tenantId), vectorFilter.eq('role', scope.operatorRole));
const supportIndex = await createToolIndex({
    model: embeddingModel,
    tools: scopedTools,
    topK: 6,
    minScore: 0.7,
    metadata: (tool) => ({
        tenantId: scope.tenantId,
        role: scope.operatorRole,
        risk: tool.name.includes('refund') ? 'high' : 'normal',
    }),
    filter: allowedFilter
});
```

Do not derive permission filters from model output or unverified request fields. Because the agent snapshots an index's filter, do not reuse a scoped index for another tenant or operator.

## 2. Authorize inside the handler

```ts
import { createTool } from '@anvia/core'
import { z } from 'zod'

const requestRefund = createTool({
  name: 'request_refund',
  description: 'Request a refund for an eligible paid order.',
  inputSchema: z.object({
    orderId: z.string(),
    amount: z.number().positive(),
    reason: z.string().min(1),
  }),
  requiresApproval: ({ amount }) =>
    amount > 100
      ? { reason: `Approve refund of ${amount}` }
      : false,
  async execute(args) {
    await auth.requirePermission(
      scope.operatorId,
      'orders:refund',
    )
    await policy.assertRefundAllowed(args)

    return refunds.request({
      ...args,
      requestedBy: scope.operatorId,
      idempotencyKey: scope.idempotencyKey,
    })
  },
})
```

Catalog metadata may be stale or misconfigured. Re-check identity, tenant, current product state, and operation policy immediately before a side effect.

## 3. Preserve runtime controls

Indexed tools selected during `agent.generate()` or `agent.stream()` use the normal execution runtime. Keep approval requirements, lifecycle handling, middleware, guardrails, and observers appropriate for their risk.

Do not remove approval merely because retrieval used a restrictive filter. Retrieval asks whether a capability is relevant and eligible for exposure; approval decides whether a specific proposed action may proceed.

## 4. Separate direct calls

`agent.callTool()` can reach any registered indexed tool without first retrieving it and does not run the full agent-turn control flow. Protect direct calls behind a separate application authorization boundary or reserve them for tests.

## 5. Observe without leaking data

Record catalog version, applied filter policy, selected tool names, and executed tool name for diagnosis. Avoid logging private arguments or tool results by default.

Next, review the [dynamic tools checklist](/sdk/advanced/dynamic-tools/checklist).
