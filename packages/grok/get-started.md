# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/grok
```

Create a client for xAI’s API:

```ts
import { AgentBuilder } from '@anvia/core'
import { GrokClient, tools as grokTools } from '@anvia/grok'

const grok = new GrokClient({
  apiKey: process.env.XAI_API_KEY,
})

const agent = new AgentBuilder('researcher', grok.completionModel())
  .tools([
    grokTools.webSearch({ allowedDomains: ['x.ai'] }),
    grokTools.codeInterpreter(),
  ])
  .defaultMaxTurns(5)
  .build()

const result = await agent.prompt('Summarize recent xAI product updates.').send()
console.log(result.output)
console.log(result.sources)
```

Responses is the default completion API and `grok-4.5` is the default model. Provider tools require the Responses adapter.

## Add media

```ts
const image = grok.imageGenerationModel()
const speech = grok.audioGenerationModel()
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
