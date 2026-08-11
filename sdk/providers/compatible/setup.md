# Endpoint setup

Install Anvia Core and its OpenAI provider adapter:

```sh
pnpm add @anvia/core @anvia/openai
```

Create the client in server-only code. Keep both the endpoint and its credential in deployment configuration:

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
  completionApi: 'chat',
})
```

`OpenAIClient` requires either `apiKey` or an already-created OpenAI SDK `client`. Browser code should call an application route; it should never receive the provider credential.

## Set the base URL correctly

Use the API root expected by the target provider, including a version segment such as `/v1` when its documentation requires one:

```dotenv
COMPATIBLE_BASE_URL=https://provider.example.com/v1
COMPATIBLE_API_KEY=replace-with-a-deployment-secret
COMPATIBLE_MODEL=provider/model-name
```

Do not guess whether the URL should include `/v1`, `/openai`, or another prefix. The OpenAI SDK appends resource paths to `baseUrl`, so a wrong root commonly produces a 404 even when the hostname and credential are valid.

Validate deployment configuration before constructing agents:

```ts
const endpoint = new URL(baseUrl)

if (endpoint.protocol !== 'https:' && endpoint.hostname !== 'localhost') {
  throw new Error('Compatible provider must use HTTPS outside local development')
}
```

## Add gateway headers

Use `headers` only for trusted values required by the endpoint, such as a gateway workspace or routing header:

```ts
const workspace = process.env.COMPATIBLE_WORKSPACE

export const compatible = new OpenAIClient({
  apiKey,
  baseUrl,
  completionApi: 'chat',
  headers: workspace
    ? { 'X-Provider-Workspace': workspace }
    : undefined,
})
```

Keep these headers server-side. Do not let a browser or model-generated tool argument supply routing, authorization, organization, or billing headers.

## Reuse an OpenAI SDK client

When the application owns transport configuration, construct the official OpenAI client first and inject it:

```ts
import OpenAI from 'openai'
import { OpenAIClient } from '@anvia/openai'

const sdk = new OpenAI({
  apiKey,
  baseURL: baseUrl,
})

export const compatible = new OpenAIClient({ client: sdk })
```

Notice the option names: Anvia's client uses `baseUrl`, while the OpenAI SDK constructor uses `baseURL`.

## Create the model boundary

Export an Anvia model from the provider module rather than exporting credentials or spreading endpoint configuration through agents:

```ts
const modelId = process.env.COMPATIBLE_MODEL

if (!modelId) {
  throw new Error('COMPATIBLE_MODEL is required')
}

export const supportModel = compatible.completionModel(modelId)
```

The calling agent now depends on an Anvia completion model, not the gateway configuration.

