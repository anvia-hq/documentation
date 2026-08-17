# Stable behavior

Treat an `Agent` as reusable runtime configuration. Put behavior that is safe and useful across every run in the constructor, and keep user, tenant, request, and authorization state at application-owned boundaries.

## 1. Configure agent defaults

The constructor can define:

- `id`, `name`, and `description` for stable identity and metadata;
- `model`, `instructions`, `temperature`, `maxTokens`, and `providerOptions` for generation;
- `context` for static documents and retrieval indexes;
- `tools`, `mcpServers`, and `skills` for reusable capabilities;
- `toolChoice` and `maxTurns` for default runtime limits;
- `outputSchema` for structured final output;
- `memory` for session-backed history;
- `guardrails` and `middlewares` for policy and request transformation; and
- `lifecycle` and `observers` for application callbacks and telemetry.

```ts
const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions using verified information.',
  context: [supportPolicy],
  tools: [searchHelpCenter],
  maxTurns: 4,
  observability: { observers: { logger } },
})
```

These values become the defaults for every run. Use the run options described in [Per-run controls](/sdk/agents/per-run-controls) only for supported request-specific values such as tracing, retries, lifecycle callbacks, guardrails, middleware, tool concurrency, or a tighter turn limit.

## 2. Create a scoped factory

When a tool depends on request-owned services or identity, construct the tool and agent inside that trusted scope:

```ts
type BillingScope = {
  model: CompletionModel
  billing: BillingService
  actor: AuthenticatedUser
}

export function createBillingAgent(scope: BillingScope) {
  const lookupInvoice = createInvoiceLookupTool({
    billing: scope.billing,
    actor: scope.actor,
  })

  const changePlan = createPlanChangeTool({
    billing: scope.billing,
    actor: scope.actor,
  })

  return new Agent({
    id: 'billing',
    model: scope.model,
    instructions: 'Use tools for all account-specific information and changes.',
    tools: [lookupInvoice, changePlan],
    maxTurns: 5,
  })
}
```

The tool closures receive the authenticated dependencies directly. They must still validate the tenant, resource, requested action, and approval state during execution.

## 3. Keep request data out of global agents

Do not place current user IDs, tenant IDs, access tokens, database records, or permission decisions in a process-wide agent's instructions or static context. That data can leak between callers or become stale.

Use:

- scoped tool closures for permissioned product actions;
- retrieval filters for tenant-specific knowledge;
- memory sessions for conversation identity;
- run-level trace metadata for correlation; and
- a new scoped agent when stable capabilities genuinely differ by caller.

## 4. Keep the security boundary in code

Instructions can describe desired behavior, but the model may misunderstand or ignore them. Authorization belongs in services and tool handlers. Retrieval adapters must enforce access before documents become model context.

A well-scoped agent can be constructed in a test with fake services and a fake completion model, without production credentials or global mutable state.

Continue with [Instructions](/sdk/agents/instructions).
