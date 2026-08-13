# Anthropic

`@anvia/anthropic` runs Anvia completions, agents, extractors, and pipelines on Claude. It adapts Anthropic's Messages API into the provider-neutral completion contract used throughout the SDK.

Use the same adapter with either Anthropic's direct API or Claude on Google Vertex AI. Only the client setup changes; the model passed to the rest of the application remains an Anvia completion model.

## Choose a connection

| Deployment | Client | Authentication |
| --- | --- | --- |
| Anthropic API | `AnthropicClient` | `ANTHROPIC_API_KEY` |
| Claude on Vertex AI | `AnthropicVertexClient` | Google Application Default Credentials |
| Anthropic-compatible endpoint | `AnthropicClient` with `baseUrl` | Endpoint-specific API key |

Start with the direct API unless the application already runs Claude through Google Cloud or needs an Anthropic-compatible gateway.

## Create a model

```ts
import { AnthropicClient } from '@anvia/anthropic'

const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export const model = anthropic.completionModel(
  'claude-sonnet-4-20250514',
)
```

Pass `model` to an agent, direct completion, extractor, or pipeline. Keep the client and credentials in server-only code.

## What the adapter supports

The completion adapter supports streaming, tools, tool choice, image input, PDF input, and Anthropic reasoning content. It does not declare support for Anvia final output schemas.

That distinction matters: use tool-backed extraction when you need structured data, and do not assume `createParsedCompletion(...)` or the agent `outputSchema` option is portable to this provider.

## In this section

- [Setup](/sdk/providers/anthropic/setup) installs the package and creates a client.
- [Capabilities](/sdk/providers/anthropic/capabilities) covers streaming, tools, media, reasoning, and structured data.
- [Model options](/sdk/providers/anthropic/model-options) explains model IDs and request settings.
- [Vertex AI](/sdk/providers/anthropic/vertex-ai) configures Google authentication.
- [Production](/sdk/providers/anthropic/production) covers boundaries, testing, and operational checks.
