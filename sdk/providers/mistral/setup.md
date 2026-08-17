# Setup

Install the Mistral adapter beside Anvia core:

```sh
pnpm add @anvia/core @anvia/mistral
```

Set `MISTRAL_API_KEY` in the server environment and create the client in a server-only module:

```ts
import { MistralClient } from '@anvia/mistral'

export const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
})
```

The constructor throws when it must create an SDK client and the API key is missing or empty. Keep credentials and provider clients out of browser bundles; browser requests should pass through your application server.

## Configure the SDK endpoint

`MistralClient` accepts three constructor options:

- `apiKey` authenticates the SDK client created by the adapter.
- `baseUrl` points that SDK client at an alternate Mistral-compatible endpoint.
- `client` reuses an existing `Mistral` SDK instance.

For example, keep an alternate server URL in trusted deployment configuration:

```ts
const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
  baseUrl: process.env.MISTRAL_BASE_URL,
})
```

An alternate endpoint may support basic completions but differ for streaming, tools, schemas, embeddings, OCR, or model listing. Smoke-test every capability the application uses.

## Bring an existing SDK client

Install the Mistral SDK directly when another infrastructure module constructs it:

```sh
pnpm add @mistralai/mistralai
```

```ts
import { Mistral } from '@mistralai/mistralai'
import { MistralClient } from '@anvia/mistral'

const sdk = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
})

export const mistral = new MistralClient({ client: sdk })
```

When `client` is supplied, the adapter uses it directly. This is useful for dependency injection or shared SDK transport configuration.

## Export configured models

Create named model dependencies at the application boundary:

```ts
export const supportModel = mistral.completionModel({
    modelId: 'mistral-large-latest'
})

export const knowledgeEmbeddings = mistral.embeddingModel({
    modelId: 'mistral-embed'
})

export const documentOcr = mistral.ocrModel({
    modelId: 'mistral-ocr-latest'
})
```

Known IDs provide editor autocomplete, while custom string IDs remain valid. Treat each selected ID as deployment configuration and verify it against the target account and endpoint.
