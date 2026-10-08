# Setup

Install the provider adapter beside Anvia core:

```sh
pnpm add @anvia/core @anvia/azure
```

Construct the client in server-only code. Provide exactly one endpoint (`endpoint` or `baseUrl`) and exactly one credential (`apiKey` or `azureADTokenProvider`):

```ts
import { AzureOpenAIClient } from '@anvia/azure'

export const azure = new AzureOpenAIClient({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})
```

`endpoint` is the resource origin, such as `https://example.openai.azure.com`; the client appends `/openai/v1/`. A path on `endpoint` is rejected. Use `baseUrl` for a complete API URL, a gateway, or a Foundry project endpoint:

```ts
const projectClient = new AzureOpenAIClient({
  baseUrl: 'https://example.services.ai.azure.com/api/projects/demo/openai/v1/',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})
```

URLs must be HTTP(S) without embedded credentials, query strings, or fragments. The adapter does not read credentials or endpoints from environment variables for you; pass them explicitly.

## Microsoft Entra authentication

Use `azureADTokenProvider` instead of `apiKey`. It is an asynchronous function that returns a bearer token, called for each request, so it owns token caching and refresh:

```ts
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity'
import { AzureOpenAIClient } from '@anvia/azure'

export const azure = new AzureOpenAIClient({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  azureADTokenProvider: getBearerTokenProvider(
    new DefaultAzureCredential(),
    'https://cognitiveservices.azure.com/.default',
  ),
})
```

Install `@azure/identity` separately. Foundry project endpoints use the `https://ai.azure.com/.default` scope; the adapter passes tokens through, so choose the scope the endpoint requires.

## Other client options

`headers` adds default SDK headers and `fetch` supplies a custom `fetch` for the managed client. The managed client uses the Azure v1 API, so no `api-version` is needed, and disables SDK retries so Anvia owns retry policy.

## Inject an SDK client

For older versioned Azure APIs, inject the OpenAI SDK's Azure client. It owns endpoint, authentication, headers, and transport, and cannot be combined with managed options:

```ts
import { AzureOpenAI } from 'openai'
import { AzureOpenAIClient } from '@anvia/azure'

export const azure = new AzureOpenAIClient({
  client: new AzureOpenAI({
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT!}/openai`,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  }),
})
```

Do not place the client, key, or token provider in a browser bundle.
