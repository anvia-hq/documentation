# Configuration

## Client options

```ts
const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY!,
  baseUrl: 'https://api.mistral.ai',
})
```

| Option | Purpose |
| --- | --- |
| `apiKey` | Required when `client` is not supplied. |
| `baseUrl` | Overrides the official SDK base URL. |
| `client` | Reuses an initialized `Mistral` SDK client. |

Managed options and `client` injection are mutually exclusive.

## Inject the official client

```ts
import { Mistral } from '@mistralai/mistralai'

const native = new Mistral({ apiKey })
const mistral = new MistralClient({ client: native })
```

Use injection when native Mistral APIs and Anvia model contracts should share credentials and transport settings.

## Embeddings

```ts
const embeddings = mistral.embeddingModel({
    modelId: 'mistral-embed',
    dimensions: 1024,
    maxBatchSize: 16
})
```

The current implementation forwards `dimensions` to Mistral and exposes it on the Anvia model as index metadata. Verify the returned dimension before creating a collection, and reindex when changing it.

## Completion and OCR pass-through

Completion request `providerOptions` is merged without allowing it to replace the adapter’s `model` or `messages`. OCR `providerOptions` likewise cannot replace `model` or `document`; explicitly typed OCR options are applied afterward.

This ordering protects the selected model and normalized source while still allowing supported provider options.

## Runtime

The package is ESM, includes declarations, uses the official Mistral SDK, and should be installed with the matching `@anvia/core` release candidate. OCR byte uploads and server credentials make it a server-side integration.
