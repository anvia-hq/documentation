# Validation and execution

Anvia validates the model-facing contract. Your handler validates whether the requested operation is allowed and correct for the product.

## Validation boundaries

| Boundary | Responsibility |
| --- | --- |
| Input schema | Parse and validate model arguments before `execute(...)`. |
| Handler | Enforce authorization, tenancy, business rules, and service behavior. |
| Output schema | Validate the value returned to the runtime. |
| Application runner | Map tool and provider failures to safe product responses. |

An input schema is not an authorization rule. A valid `invoiceId` can still belong to another user, so the handler must check access before reading or changing data.

## Handle expected and unexpected failures

Return a concise result when a miss is expected and safe for the model to reason about.

```ts
async execute({ orderId }) {
  const order = await orders.find(orderId)

  if (order === undefined) {
    return 'No order was found for that ID.'
  }

  return `Order ${order.id} is ${order.status}.`
}
```

Throw for dependency failures, invalid service state, or rejected policy checks. During an agent run, Anvia normally converts the failure into model-visible tool output so the agent can respond or recover. Error messages are not redacted automatically: map private service details to a safe message before throwing. A handler error does not itself terminate the agent loop. Use lifecycle callbacks for observation; enforce a hard policy before or inside the handler.

## Receive a call context

`execute` receives a second `context` argument alongside the parsed input.

```ts
async execute({ orderId }, context) {
  const order = await orders.find(orderId, { signal: context.abortSignal })
  return `Order ${order.id} is ${order.status}.`
}
```

`context.abortSignal` aborts when the run stops, so pass it to in-flight work. `context.emitStreamEvent` emits custom events on the run's stream while the handler executes. Direct calls pass the same context: `tool.call(input, context)`.

Application code can call a known tool directly through `tool.call(input)`. The agent runtime owns model-produced JSON parsing, tool lookup, and the corresponding tool-call errors.

## Call through the agent

The agent registry resolves the tools passed to `Agent`. `agent.getTool(name)` returns a registered tool, and `agent.callTool(name, args)` parses a JSON argument string the way the runtime does for the model, validates it against the input schema, and returns the normalized output (`{ type: 'text' | 'json' | 'content', ... }`).

```ts
const result = await agent.callTool('get_invoice', JSON.stringify({ invoiceId: 'inv_123' }))
```

This path skips the run lifecycle, approval, and middleware, so reserve it for trusted application code.

## Test the handler first

Call the tool directly so contract and product behavior can be tested without a provider request.

```ts
const tool = createGetInvoiceTool(fakeScope)
const result = await tool.call({ invoiceId: 'inv_123' })

expect(result.status).toBe('paid')
```

Add agent-level tests separately for tool selection, argument quality, and failure recovery.

## Public tool errors

Import from `@anvia/core/tool`:

| Error | Trigger boundary | Diagnostic fields |
| --- | --- | --- |
| `ToolNotFoundError` | `agent.callTool` cannot find a registered name. | `toolName` |
| `ToolJsonError` | `agent.callTool` cannot parse raw JSON arguments as strict JSON. | `cause` (may contain input details) |
| `ToolCallError` | Argument schema, handler, output schema, or result normalization failed through the agent tool-call path. | `cause`, original error message |
| `ToolResultSerializationError` | `normalizeToolResultOutput` receives a non-string/non-JSON/non-rich-content value. | `output` (raw, potentially private) |

`tool.call(input)` validates schemas and returns the handler's typed value; it does not add the
agent's JSON-argument or `ToolCallError` wrapper. `agent.callTool(name, rawJson)` returns normalized
output; normalization errors become `ToolCallError` with `ToolResultSerializationError` as cause.
Returning a Date, undefined, a function, cyclic data, or invalid rich content cannot be normalized.
Use `ToolOutput.content(...)` for supported text/file parts.

Treat `cause`, `output`, and messages as protected diagnostics. No class automatically redacts them.
An agent used as a tool also has [adapter-specific suspension/blocking errors](/sdk/agents/errors-and-limits#_6-distinguish-outcomes-from-adapter-errors).
