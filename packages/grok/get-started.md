# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/grok
```

Create a client for xAI’s API:

```ts
import { Agent } from '@anvia/core'
import { GrokClient, tools as grokTools } from '@anvia/grok'

const grok = new GrokClient({
  apiKey: process.env.XAI_API_KEY!,
})

const agent = new Agent({
  id: 'researcher',
  model: grok.completionModel({ modelId: 'grok-4.5', api: 'responses' }),
  maxTurns: 5,
  tools: [grokTools.webSearch({ allowedDomains: ['x.ai'] }), grokTools.codeInterpreter()],
})

const result = await agent.generate({
    prompt: 'Summarize recent xAI product updates.'
})

if (result.status === 'completed') {
  console.log(result.output)
  console.log(result.sources)
}
```

The example selects Responses and `grok-4.5` explicitly. Provider tools require the Responses adapter.

## Add media

```ts
const image = grok.imageGenerationModel({ modelId: 'grok-imagine-image' })
const speech = grok.speechGenerationModel()
const transcription = grok.transcriptionModel()
```

These are batch media APIs. Realtime voice and streaming speech are not included.

## Before production

- Keep xAI credentials server-side.
- Allowlist provider tools and their domains, handles, stores, or MCP servers.
- Treat remote MCP headers and authorization as secrets.
- Bound turns and server-tool activity.
- Pass `fetch` explicitly in runtimes without a global implementation.
- Test image ratios and audio formats against the current xAI API.
