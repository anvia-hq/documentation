# `@anvia/anthropic`

Anthropic’s provider adapter supplies streaming Claude completion models for Anvia agents, direct completions, extractors, and pipelines. It supports Anthropic’s API, compatible Messages endpoints, and Claude on Google Vertex AI.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.5.1` |
| Runtime | ESM, server-side JavaScript |
| Peer | `@anvia/core >=0.7.1 <1.0.0` |

## Install

```bash
pnpm add @anvia/anthropic @anvia/core
```

## Create a Claude agent

```ts
import { Agent } from '@anvia/core'
import { AnthropicClient } from '@anvia/anthropic'

const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const agent = new Agent({
  id: 'assistant',
  model: anthropic.completionModel('claude-sonnet-4-20250514'),
  instructions: 'Give direct, well-supported answers.',
})

const result = await agent.prompt('Summarize the release notes.').send()
console.log(result.output)
```

## Capabilities

| Capability | Support |
| --- | --- |
| Completion and streaming | Yes |
| Tools and structured output | Yes |
| Text and image message content | Yes |
| Model listing | Anthropic API client only |
| Vertex AI | Dedicated client |
| Embeddings and media generation | No |

The package maps Anvia history, documents, tools, tool results, reasoning, streaming events, and usage to Anthropic Messages. It intentionally does not pretend that Anthropic exposes Anvia embedding or media model contracts.

## Common patterns

### Use an Anthropic-compatible endpoint

```ts
const compatible = new AnthropicClient({
  apiKey: process.env.PROVIDER_API_KEY,
  baseUrl: 'https://provider.example.com',
})

const model = compatible.completionModel('provider/model-name')
```

### Run Claude through Vertex AI

```ts
import { AnthropicVertexClient } from '@anvia/anthropic'

const vertex = new AnthropicVertexClient({
  projectId: 'my-gcp-project',
  region: 'global',
})

const model = vertex.completionModel('claude-sonnet-5')
```

The Vertex client follows Google authentication through the official Anthropic Vertex SDK. It can use Application Default Credentials or explicit SDK authentication options, but it does not expose `listModels()` because Vertex does not provide Anthropic’s Models API.

## Compatibility

`@anvia/anthropic` is ESM and depends on the official Anthropic and Anthropic Vertex SDKs. `AnthropicClient` accepts a preconfigured `Anthropic` client. `AnthropicVertexClientOptions` extends the official Vertex `ClientOptions`, so transport and authentication compatibility follow that SDK.

## Continue

- [Get started](/packages/anthropic/get-started)
- [Capabilities](/packages/anthropic/capabilities)
- [Configuration](/packages/anthropic/configuration)
- [Compatible endpoints](/packages/anthropic/compatible-endpoints)
- [Vertex AI](/packages/anthropic/vertex-ai)
- [API reference](/packages/anthropic/api-reference)
- [Releases](/packages/anthropic/releases)
- [Anthropic SDK guide](/sdk/providers/anthropic)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-anthropic/CHANGELOG.md)
