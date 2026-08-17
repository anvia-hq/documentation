# Endpoint setup

Install Anvia Core and the OpenAI provider adapter:

```sh
pnpm add @anvia/core @anvia/openai
```

Create the client in server-only code. Keep the endpoint and credential in deployment configuration:

```ts
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.COMPATIBLE_API_KEY
const baseUrl = process.env.COMPATIBLE_BASE_URL

if (!apiKey || !baseUrl) {
  throw new Error('Compatible provider configuration is incomplete')
}

export const compatible = new OpenAIClient({
  apiKey,
  baseUrl,
})
```

`OpenAIClient` requires an API key when it creates the underlying SDK client. Alternatively, pass an already-created SDK `client`. Browser code should call your server, never receive the provider credential.

## Set the API root correctly

Use the API root documented by the target provider, including `/v1` or another path prefix when required:

```dotenv
COMPATIBLE_BASE_URL=https://provider.example.com/v1
COMPATIBLE_API_KEY=replace-with-a-deployment-secret
COMPATIBLE_MODEL=provider/model-name
```

Do not guess the prefix. The OpenAI SDK appends resource paths to `baseUrl`, so an incorrect root commonly returns 404 even when the hostname and credential are valid.

Validate trusted configuration before constructing models:

```ts
const endpoint = new URL(baseUrl)

if (endpoint.protocol !== 'https:' && endpoint.hostname !== 'localhost') {
  throw new Error('Compatible provider must use HTTPS outside local development')
}
```

## Add trusted gateway headers

Use `headers` for server-controlled gateway values such as workspace or route selection:

```ts
const workspace = process.env.COMPATIBLE_WORKSPACE

export const compatible = new OpenAIClient({
  apiKey,
  baseUrl,
  headers: workspace
    ? { 'X-Provider-Workspace': workspace }
    : undefined,
})
```

Do not let a browser request or model-generated tool argument choose authorization, organization, billing, or routing headers.

## Reuse an OpenAI SDK client

When application infrastructure owns SDK transport configuration, inject that client:

```ts
import OpenAI from 'openai'
import { OpenAIClient } from '@anvia/openai'

const sdk = new OpenAI({
  apiKey,
  baseURL: baseUrl,
})

export const compatible = new OpenAIClient({ client: sdk })
```

The option names differ intentionally: Anvia uses `baseUrl`, while the OpenAI SDK uses `baseURL`.

## Export the model boundary

```ts
const modelId = process.env.COMPATIBLE_MODEL

if (!modelId) {
  throw new Error('COMPATIBLE_MODEL is required')
}

export const supportModel = compatible.completionModel({
    modelId: modelId
})
```

Agents now depend on an Anvia completion model rather than credentials or endpoint configuration.
