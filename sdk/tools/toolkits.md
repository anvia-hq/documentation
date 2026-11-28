# Toolkits

A toolkit groups related tools under one name, with optional shared instructions, and lets each
agent take only the tools it needs. Add a toolkit to `Agent.tools` like any tool; Anvia expands it
into its selected tools and appends its instructions to the agent's instructions. Toolkits are
available in `@anvia/core` 1.25.0 and later.

## Create a toolkit

```ts
import { Agent, createTool, createToolkit } from '@anvia/core'
import { z } from 'zod'

const getInvoice = createTool({
  name: 'get_invoice',
  description: 'Look up one invoice available to the current user.',
  inputSchema: z.object({ invoiceId: z.string().min(1) }),
  async handler({ invoiceId }) {
    return billing.getInvoice(user.id, invoiceId)
  },
})

const voidInvoice = createTool({
  name: 'void_invoice',
  description: 'Void an unpaid invoice.',
  inputSchema: z.object({ invoiceId: z.string().min(1) }),
  async handler({ invoiceId }) {
    return billing.voidInvoice(user.id, invoiceId)
  },
})

const billingTools = createToolkit({
  name: 'billing',
  tools: [getInvoice, voidInvoice],
  instructions: 'Use billing tools only for invoices the user asks about.',
})

const agent = new Agent({
  id: 'support',
  model,
  instructions: 'Answer support questions clearly.',
  tools: [billingTools],
})
```

`billing`, `user`, and `model` are application-owned. Authorize the current user inside each handler;
grouping tools does not add permissions.

`createToolkit(definition, options?)` returns a frozen `Toolkit` object (`kind: 'toolkit'`). Use
`isToolkit(value)` to recognize one. Creation throws when the name is blank, when two tools share a
name, or when a tool comes from an MCP server: register MCP servers through `Agent.mcpServers`.

## Select and adapt tools per agent

Pass `ToolkitOptions` as the second argument to adapt the same tools for a different agent:

```ts
const readOnlyBilling = createToolkit(
  { name: 'billing', tools: [getInvoice, voidInvoice] },
  {
    include: ['get_invoice'],
    prefix: 'billing_',
    timeoutMs: 10_000,
    instructions: false,
  },
)
```

| Option | Effect |
| --- | --- |
| `include` | Keep only these tools. Names are the original, unprefixed names. |
| `exclude` | Remove these tools, applied after `include`. |
| `prefix` | Prepend to every model-facing tool name, for example `billing_get_invoice`. |
| `requiresApproval` | `true` or `false` for every selected tool, or a record keyed by unprefixed tool name. |
| `timeoutMs` | Abort each call after this many milliseconds. Must be positive. |
| `instructions` | Replace the default instructions, or `false` to omit them. |

Unknown names in `include`, `exclude`, or a `requiresApproval` record throw at creation, so a renamed
tool cannot silently fall out of a selection. A timed-out call aborts the tool's signal and fails
with `Tool "<name>" timed out after <n>ms.`

::: warning Approval overrides replace the tool's setting
A toolkit `requiresApproval` value replaces each selected tool's own `requiresApproval`; it does not
combine with it. `requiresApproval: false` therefore removes approval from a tool that declared it.
Keep approval on side-effecting tools, and enforce permissions in the handler regardless.
:::

## How agents combine toolkits

- Toolkit instructions are appended after `Agent.instructions`, in `tools` array order, and before
  skill instructions, separated by blank lines.
- Each toolkit tool must have a unique name across the agent. A duplicate throws a `TypeError` such
  as `Duplicate toolkit "billing" tool name "get_invoice".` Use `prefix` to mount two copies of
  the same toolkit.
- `createToolIndex({ tools })` and `embedTools(...)` also accept toolkits and flatten them into
  their tools. Toolkit instructions are not used there, and repeated names follow the index rule:
  the last tool with a name wins. See [Tool sets](/sdk/advanced/dynamic-tools/tool-sets).

## Ready-made toolkits

These first-party factories return toolkits and accept the same `ToolkitOptions`:

- [`@anvia/extensions`](/packages/extensions/toolkits): web search, web fetch, filesystem, shell,
  git, HTTP, todo, scratchpad, date and time, and math toolkits, plus `withToolCache`,
  `withToolTimeout`, `withToolRetry`, `withToolRateLimit`, and `withToolSummary` wrappers.
  `@anvia/extensions` is pre-1.0.
- [`@anvia/sandbox`](/sdk/advanced/sandbox): `sandboxToolkit()` and `desktopToolkit()` for
  container and desktop sandboxes.

Next, review [tool security](/sdk/tools/security).
