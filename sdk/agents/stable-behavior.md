# Stable behavior

Put behavior that is safe and useful across every run in `Agent` options. Keep user, tenant, and request state outside global agents.

## Agent defaults

| Option | Adds |
| --- | --- |
| `instructions` | Durable policy, role, tone, and workflow rules. |
| `context` | Small static documents safe for every run. |
| `tools` | Stable product actions. |
| `memory` | Session-backed conversation history. |
| `dynamicContexts` | Retrieval-selected knowledge. |
| `observers` | Logger, Lens, and other telemetry adapters. |
| `hook` | Default runtime control. |
| `outputSchema` | A typed final output contract. |
| `maxTurns` | The default loop limit. |

Combine multiple instruction blocks explicitly, for example with `blocks.join('\n\n')`. Keep their
order intentional and avoid contradictory rules.

## Use a scoped factory

Build an agent inside the scope that knows the current user when tools or stores need request-owned dependencies.

```ts
export function createBillingAgent(scope: BillingScope) {
  const tools = [
    createInvoiceLookupTool(scope.services.billing, scope.user),
    createPlanChangeTool(scope.services.billing, scope.user),
  ]

  return new Agent({
    id: 'billing',
    model: scope.model,
    instructions: 'Use tools for account-specific information.',
    memory: { store: scope.memory },
    tools: [...tools],
  })
}
```

Tool handlers must enforce authorization. Instructions can describe desired behavior, but they are not a security boundary.

## Keep the boundary clear

Use static context only for small facts that are safe for every caller. Move large, changing, permissioned, or tenant-specific information to [knowledge retrieval](/sdk/knowledges) or tools.

A well-scoped agent can be constructed in a test with fake services and a fake model, without production secrets.
