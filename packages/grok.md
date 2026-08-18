# `@anvia/grok`

Grok’s provider adapter connects Anvia to xAI completions, provider-executed search and code tools, image generation, batch speech, transcription, and model listing. It delegates compatible completion behavior to `@anvia/openai` while adding xAI-specific models and tools.

| | |
| --- | --- |
| Support | First-party |
| Version | `1.0.0-rc.2` |
| Runtime | ESM, server-side JavaScript with `fetch` |
| Peer | Matching `@anvia/core` release candidate |

## Install

```bash
pnpm add @anvia/grok @anvia/core
```

## Create a Grok agent

```ts
import { Agent } from '@anvia/core'
import { GrokClient, tools as grokTools } from '@anvia/grok'

const grok = new GrokClient({
  apiKey: process.env.XAI_API_KEY!,
})

const agent = new Agent({
  id: 'researcher',
  model: grok.completionModel({ modelId: 'grok-4.5', api: 'responses' }),
  tools: [grokTools.webSearch({ allowedDomains: ['x.ai'] })],
})

const result = await agent.generate({
    prompt: 'Summarize the latest xAI product updates.'
})

if (result.status === 'completed') {
  console.log(result.output)
  console.log(result.sources)
}
```

## Capabilities

| Capability | Factory or export | Default |
| --- | --- | --- |
| Streaming completion | `completionModel({ modelId, api })` | Explicit model and API |
| Server tools | `tools.*` | Responses API only |
| Image generation | `imageGenerationModel({ modelId })` | Explicit model |
| Text-to-speech | `speechGenerationModel()` | Provider-selected |
| Transcription | `transcriptionModel()` | Provider-selected |
| Model inventory | `listModels()` | Provider model list |

The typed provider tools include web search, X search, code interpreter, xAI file search, and remote MCP. They run on xAI’s servers and are not local Anvia tools. The Chat Completions adapter does not support them.

## Common patterns

### Select Chat Completions explicitly

```ts
const chat = new GrokClient({
  apiKey: process.env.XAI_API_KEY!,
}).completionModel({
  modelId: 'grok-4.5',
  api: 'chat',
})
```

Use Chat only when the workflow specifically requires that API and does not depend on Grok provider tools.

### Generate an image

```ts
const image = await grok.imageGenerationModel({ modelId: 'grok-imagine-image-quality' }).imageGeneration({
  prompt: 'A robot sketching a distributed system on glass',
  width: 1024,
  height: 1024,
})

console.log(image.images[0].data.byteLength)
```

Supported width/height ratios map to xAI aspect ratios; unsupported ratios become `auto`. An explicit `providerOptions.aspect_ratio` takes precedence.

## Compatibility

`@anvia/grok` is ESM, depends on `@anvia/openai` and the official `openai` SDK, and targets `https://api.x.ai/v1` by default. Image URL responses and batch speech require a `fetch` implementation; pass one through `GrokClientOptions` on runtimes without global `fetch`.

The package does not expose embeddings, video generation, realtime voice, streaming speech, file management, or collection management.

## Continue

- [Get started](/packages/grok/get-started)
- [Capabilities](/packages/grok/capabilities)
- [Configuration](/packages/grok/configuration)
- [Server tools](/packages/grok/server-tools)
- [Models and media](/packages/grok/models-and-media)
- [API reference](/packages/grok/api-reference)
- [Releases](/packages/grok/releases)
- [Provider capability matrix](/sdk/providers/capability-matrix)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-grok/CHANGELOG.md)
