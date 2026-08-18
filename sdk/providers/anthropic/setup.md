# Setup

Install the Anthropic adapter next to the core runtime:

```bash
pnpm add @anvia/core @anvia/anthropic
```

## Configure the direct API

Set the API key in the server environment:

```sh
ANTHROPIC_API_KEY="your-api-key"
```

Create the client in a server-only module:

```ts
import { AnthropicClient } from '@anvia/anthropic'

export const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const completionModel = anthropic.completionModel({
    modelId: 'claude-sonnet-5'
})
```

The constructor fails when neither `apiKey` nor an existing Anthropic SDK `client` is supplied. Fail during application startup instead of waiting for the first user request.

## Use it with an agent

```ts
import { Agent } from '@anvia/core'
import { completionModel } from './anthropic'

export const supportAgent = new Agent({
  id: 'support',
  model: completionModel,
  instructions: 'Answer support questions clearly. Use tools for account data.',
  maxTurns: 4,
})
```

The agent is provider-neutral. Provider selection stays in the model module, which makes testing and later model changes easier.

## Use an Anthropic-compatible endpoint

Pass a custom `baseUrl` when a gateway exposes an Anthropic-compatible Messages API:

```ts
const client = new AnthropicClient({
  apiKey: process.env.PROVIDER_API_KEY!,
  baseUrl: process.env.PROVIDER_BASE_URL,
})

const model = client.completionModel({
    modelId: 'provider/model-name'
})
```

Compatibility labels do not guarantee identical behavior. Smoke test streaming, required tool calls, media blocks, usage reporting, and error responses against the exact endpoint.

## Keep credentials out of the browser

Browser code should call an application route that owns the agent or completion request. Never expose an Anthropic key through client-side environment variables, serialized props, or a public configuration endpoint.

