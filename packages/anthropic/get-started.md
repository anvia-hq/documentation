# Get started

Install the provider with Core:

```sh
pnpm add @anvia/core @anvia/anthropic
```

Create the client on the server and pass its completion model into an agent:

```ts
import { AgentBuilder } from '@anvia/core'
import { AnthropicClient } from '@anvia/anthropic'

const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const agent = new AgentBuilder(
  'analyst',
  anthropic.completionModel('claude-sonnet-4-20250514'),
)
  .instructions('Analyze the evidence before answering.')
  .build()

const result = await agent.prompt('Summarize the incident report.').send()
console.log(result.output)
```

The returned `AnthropicCompletionModel` works with direct completion, streaming, tools, agents, extractors, and pipeline stages.

## List Anthropic models

```ts
const models = await anthropic.listModels()
```

Use listing for inventory and diagnostics. Keep a separate production allowlist rather than enabling every returned model automatically.

## Use Vertex AI instead

```ts
import { AnthropicVertexClient } from '@anvia/anthropic'

const vertex = new AnthropicVertexClient({
  projectId: 'my-gcp-project',
  region: 'global',
})

const model = vertex.completionModel('claude-sonnet-5')
```

Vertex uses the same normalized completion adapter but a different official SDK and authentication path. It does not expose `listModels()`.

## Before production

- Keep Anthropic and Google credentials out of browser code.
- Set explicit model IDs and output limits.
- Authorize every tool inside the application, not only through its schema.
- Bound agent turns and cancellation.
- Test image input and tool behavior against the selected model.
- Review [Vertex AI](/packages/anthropic/vertex-ai) or [compatible endpoints](/packages/anthropic/compatible-endpoints) when not using Anthropic’s standard API.
