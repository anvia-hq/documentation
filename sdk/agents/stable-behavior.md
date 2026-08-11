# Stable behavior

Put behavior that is safe and useful across every run on `AgentBuilder`. Keep user, tenant, and request state outside global agents.

## Builder defaults

| Method | Adds |
| --- | --- |
| `.instructions(...)` | Durable policy, role, tone, and workflow rules. |
| `.context(text, id)` | Small static documents safe for every run. |
| `.tools(...)` | Stable product actions. |
| `.memory(...)` | Session-backed conversation history. |
| `.dynamicContext(...)` | Retrieval-selected knowledge. |
| `.eventStore(...)` | Runtime event persistence. |
| `.observe(...)` | Telemetry adapters. |
| `.hook(...)` | Default runtime control. |
| `.outputSchema(...)` | A typed final output contract. |
| `.defaultMaxTurns(...)` | The default loop limit. |

Multiple `.instructions(...)` calls append blocks; they do not replace earlier instructions. Keep their order intentional and avoid contradictory rules.

## Use a scoped factory

Build an agent inside the scope that knows the current user when tools or stores need request-owned dependencies.

```ts
export function createBillingAgent(scope: BillingScope) {
  const tools = [
    createInvoiceLookupTool(scope.services.billing, scope.user),
    createPlanChangeTool(scope.services.billing, scope.user),
  ]

  return new AgentBuilder('billing', scope.model)
    .instructions('Use tools for account-specific information.')
    .tools(tools)
    .memory(scope.memory)
    .build()
}
```

Tool handlers must enforce authorization. Instructions can describe desired behavior, but they are not a security boundary.

## Keep the boundary clear

Use static context only for small facts that are safe for every caller. Move large, changing, permissioned, or tenant-specific information to [knowledge retrieval](/sdk/knowledges) or tools.

A well-scoped agent can be constructed in a test with fake services and a fake model, without production secrets.
