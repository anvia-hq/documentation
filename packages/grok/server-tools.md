# Server tools

xAI provider tools run on xAI infrastructure. They are configurations, not local `execute` functions.

```ts
import { tools as grokTools } from '@anvia/grok'

const agent = new Agent({
  id: 'researcher',
  model: grok.completionModel({ modelId: 'grok-4.5', api: 'responses' }),
  tools: [localDatabaseTool, grokTools.webSearch({ allowedDomains: ['x.ai'] }), grokTools.xSearch({ allowedHandles: ['xai'] }), grokTools.codeInterpreter()],
})
```

Core separates local executable tools from provider tools. The Responses adapter sends provider tools to xAI and normalizes returned sources and provider tool calls.

## Web and X search

`webSearch()` accepts either allowed or excluded domains, not both, with at most five values. It can enable image understanding and image search.

`xSearch()` accepts either allowed or excluded handles, not both, with at most 20. Dates must use `YYYY-MM-DD`, and `fromDate` cannot be later than `toDate`.

## File search

```ts
const search = grokTools.fileSearch({
  vectorStoreIds: ['store_123'],
  maxNumResults: 8,
})
```

At least one non-empty vector-store ID is required. `maxNumResults`, when present, must be a positive integer. The package does not create or manage xAI vector stores.

## Remote MCP

```ts
const remote = grokTools.mcp({
  serverUrl: 'https://mcp.example.com',
  serverLabel: 'internal-catalog',
  allowedTools: ['lookup_product'],
  authorization: `Bearer ${token}`,
})
```

The URL must be HTTPS. Labels, authorization, header names, and header values must be non-empty. Credentials are sent to xAI so it can call the remote server; Anvia omits sensitive authorization and headers from its request trace summary.

## Operational controls

- Provider tools require the Responses adapter.
- Restrict search sources and MCP tools to what the use case needs.
- Authorize remote resources independently of model selection.
- Bound `max_turns` and request cancellation.
- Inspect `result.sources` and `result.providerToolCalls` when evidence matters.
- Treat provider execution as an external side effect with its own availability and billing.
