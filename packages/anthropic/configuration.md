# Configuration

Choose the client that matches the serving platform.

## Anthropic API

```ts
const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseUrl: 'https://api.anthropic.com',
})
```

| Option | Purpose |
| --- | --- |
| `apiKey` | Required when `client` is absent. |
| `baseUrl` | Targets Anthropic or a compatible Messages endpoint. |
| `client` | Reuses an initialized official `Anthropic` SDK client. |

Inject an official client when custom timeouts, retries, transports, or headers should be configured at the SDK layer:

```ts
import Anthropic from '@anthropic-ai/sdk'

const native = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  timeout: 60_000,
})

const anthropic = new AnthropicClient({ client: native })
```

## Completion options

Use Anvia request fields for messages, documents, tools, token limits, temperature, and cancellation. Put provider-specific options in completion `providerOptions`. Validate them against the selected Anthropic SDK and model; the adapter does not make vendor options portable.

## Vertex AI

`AnthropicVertexClientOptions` extends the official Vertex SDK `ClientOptions`. It supports project, region, Google authentication, access tokens, and transport configuration. See [Vertex AI](/packages/anthropic/vertex-ai) for examples and deployment boundaries.

## Runtime and production

The package is ESM, includes declarations, and should be installed with the matching `@anvia/core` release candidate. It depends on the official Anthropic and Anthropic Vertex SDKs. Keep both clients server-side.

Set explicit model IDs in deployment configuration. Provider aliases can change behavior without a code change; dated IDs give more reproducible runs when the provider supports them.
