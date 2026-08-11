# Tool sets

`ToolSet` stores concrete tool implementations and provides the execution boundary used by static and dynamic agents.

## Create a tool set

```ts
import { AgentBuilder } from '@anvia/core'
import { ToolSet } from '@anvia/core/tool'

const supportToolSet = ToolSet.fromTools([
  createSearchOrdersTool(scope),
  createGetInvoiceTool(scope),
  createEscalationTool(scope),
])

const agent = new AgentBuilder('support', model)
  .useToolSet(supportToolSet)
  .build()
```

`.useToolSet(...)` makes every tool in the set static, so its definition is available on every model turn.

## Inspect the set

```ts
supportToolSet.contains('get_invoice')
supportToolSet.get('get_invoice')
supportToolSet.values()
```

The lower-level surface includes:

| Method | Purpose |
| --- | --- |
| `addTool(...)` | Add one concrete tool. |
| `addTools(...)` | Add an array or another `ToolSet`. |
| `deleteTool(name)` | Remove a tool by name. |
| `contains(name)` | Check whether a tool exists. |
| `get(name)` | Return one concrete tool. |
| `values()` | Return all tools. |
| `getToolDefinitions(prompt?)` | Resolve model-facing definitions. |
| `call(name, args, context?)` | Parse raw JSON arguments and execute a tool. |

Most applications should build a set once from known tools and let the agent runtime call it.

## Call a tool directly

```ts
const output = await supportToolSet.call(
  'get_invoice',
  JSON.stringify({ invoiceId: 'inv_123' }),
)
```

Direct calls are useful in tests and internal tooling. `call(...)` can raise `ToolNotFoundError`, `ToolJsonError`, or `ToolCallError`; map them at the runner boundary when invoking the set outside an agent.

## Avoid shared mutable scope

Do not mutate a global `ToolSet` for each request. If tool handlers close over a user, tenant, transaction, or idempotency key, create the tools and set at that request's trusted runner boundary.

Stable stateless tools may be shared, but every execution still needs access to the correct authorization context.

## How it relates to dynamic tools

A `DynamicToolIndex` combines vector search with a backing `ToolSet`. Search returns matching definitions; the backing set provides the implementation when the model calls one of them.
