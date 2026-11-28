# Tools and MCP

Tools let an agent read product data and request side effects through typed contracts your application owns. Define local tools with `createTool()`, connect remote tools over MCP with `@anvia/mcp`, and search large catalogs so the model sees only the relevant definitions.

## When to use it

- The agent needs live data or actions from your services, such as orders, tickets, or deployments.
- A side effect such as a refund or message should pause for human approval before it runs.
- An external MCP server already exposes the capability you need.
- The tool catalog is large enough that sending every definition adds noise; use a tool index or `searchTool()`.
- The agent should follow reusable procedures packaged as skills.

## How it works

The model sees each tool's name, description, and JSON schema. When it requests a tool, Anvia validates the arguments against `inputSchema`, calls your `handler`, validates the result against `outputSchema` if present, and sends the result back into the run. `requiresApproval` suspends the run with an `interaction` outcome before the handler executes.

```ts
import { Agent, createTool } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
const model = client.completionModel({ modelId: 'gpt-5.6-sol', api: 'responses' })

const refundOrder = createTool({
  name: 'refund_order',
  description: 'Refund an eligible order.',
  inputSchema: z.object({ orderId: z.string() }),
  requiresApproval: ({ orderId }) => ({ reason: `Approve refund for ${orderId}` }),
  handler: async ({ orderId }) => billing.refund(orderId),
})

const agent = new Agent({ id: 'billing', model, tools: [refundOrder], maxTurns: 3 })
```

`billing` is your application's billing service. Use `handler`; `execute` is deprecated and will be removed.

Beyond local tools:

- **Toolkits.** `createToolkit()` from `@anvia/core` groups tools with shared instructions, and per-agent `include`, `exclude`, `prefix`, approval, and timeout options. Pass it in `Agent.tools`.
- **Ready-made tools.** `@anvia/extensions` (pre-1.0) provides web search, web fetch, filesystem, shell, git, HTTP, todo, scratchpad, date and time, and math toolkits, plus tool wrappers, guardrails, middleware, and lifecycle hooks. Review each toolkit's approval defaults and limits before exposing it.
- **Questions.** `createQuestionTool()` from `@anvia/core/tool` lets the model ask structured clarifying questions, returned as a `tool-question` interaction.
- **Dynamic tools.** `createToolIndex()` from `@anvia/core/tool` embeds a catalog and exposes only matching definitions each turn. `searchTool()` gives the model one tool that searches your entries, such as runbooks. Pass either in `Agent.tools`.
- **MCP.** `new McpClient({ name, transport })` from `@anvia/mcp` connects over stdio or streamable HTTP; `await client.connect()` returns a server you register through `mcpServers`, not `tools`. Close the client when you are done.
- **Skills.** `loadSkills(skill.local('skills'))` from `@anvia/core/skills` loads `SKILL.md` packages; pass the result as `skills` so the agent loads detailed guidance only when a task matches.

## What your application owns

- Authorization, tenant scope, rate limits, and audit logging inside every handler. Schemas validate shape, not permission.
- Approval decisions from an authenticated approver, and idempotent side effects.
- MCP credentials, connection lifetime, and the reviewed subset of remote tools you register. An MCP connection does not grant product authorization.
- Filtering tool results and remote output before they reach a browser.
- Trust in skill directories and the scripts they may run.

## Go deeper

- [Tools](/sdk/tools): define, register, stream, and approve tools.
- [Toolkits](/sdk/tools/toolkits): group, select, and prefix tools per agent.
- [`@anvia/extensions`](/packages/extensions): ready-made toolkits, guardrails, middleware, and hooks.
- [Tool security](/sdk/tools/security): enforce permissions at the handler boundary.
- [Interactions and continuations](/sdk/agents/interactions): approvals and structured questions.
- [Dynamic tools](/sdk/advanced/dynamic-tools): tool indexes for large catalogs.
- [Domain search](/sdk/advanced/dynamic-tools/domain-search): `searchTool()` over your own entries.
- [MCP](/sdk/advanced/mcp): connect, review, and secure external tool servers.
- [MCP package](/packages/mcp/get-started): install and configure `@anvia/mcp`.
- [Skills](/sdk/advanced/skills): package reusable procedures, references, and scripts.
