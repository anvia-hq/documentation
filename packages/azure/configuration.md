# Configuration

Configure `AzureOpenAIClient` once, then create capability-specific model objects. Pass credentials and the endpoint explicitly; the adapter does not read environment variables for you.

## Client options

| Option | Purpose |
| --- | --- |
| `endpoint` | Azure resource origin, such as `https://example.openai.azure.com`. The client appends `/openai/v1/`. |
| `baseUrl` | Full API URL or gateway, including Foundry project endpoints. Used instead of `endpoint`. |
| `apiKey` | Azure API key. Must be a non-empty string. |
| `azureADTokenProvider` | Asynchronous function returning a Microsoft Entra bearer token. Used instead of `apiKey`. |
| `headers` | Default SDK headers for the managed client. |
| `fetch` | Custom `fetch` for the managed client. |
| `client` | Reuses an initialized official OpenAI SDK client. Cannot be combined with any option above. |

The constructor validates its input and throws a `TypeError` when:

- both or neither of `endpoint` and `baseUrl` are given;
- both or neither of `apiKey` and `azureADTokenProvider` are given;
- `apiKey` is empty, or `azureADTokenProvider` is not a function, or the provider returns an empty token;
- the URL is not HTTP(S), or contains credentials, a query string, or a fragment;
- `endpoint` has a path (it must be a resource origin; use `baseUrl` for a full API URL);
- `client` is combined with managed options.

The managed client uses the Azure v1 API, so no `api-version` query parameter is needed, and it sets SDK retries to `0` so Anvia owns retry policy.

## Resource endpoint with an API key

```ts
const client = new AzureOpenAIClient({
  endpoint: 'https://example.openai.azure.com',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})
```

Azure OpenAI resource domains and `services.ai.azure.com` resource domains can both be used. For a complete API URL or a gateway, use `baseUrl`:

```ts
const client = new AzureOpenAIClient({
  baseUrl: 'https://example.services.ai.azure.com/openai/v1/',
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})
```

## Microsoft Entra authentication

Pass an asynchronous token provider instead of `apiKey`. Install `@azure/identity` separately when using this example:

```ts
import { DefaultAzureCredential, getBearerTokenProvider } from '@azure/identity'

const client = new AzureOpenAIClient({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  azureADTokenProvider: getBearerTokenProvider(
    new DefaultAzureCredential(),
    'https://cognitiveservices.azure.com/.default',
  ),
})
```

The token provider is called for each request and owns token caching and refresh. The adapter passes tokens through without choosing a scope.

## Foundry project endpoints

Use the full project URL and the project token scope:

```ts
const projectClient = new AzureOpenAIClient({
  baseUrl: 'https://example.services.ai.azure.com/api/projects/demo/openai/v1/',
  azureADTokenProvider: getBearerTokenProvider(
    new DefaultAzureCredential(),
    'https://ai.azure.com/.default',
  ),
})
```

Select the scope required by the endpoint you call.

## Deployments and models

```ts
const chat = client.completionModel({ modelId: 'my-chat-deployment' })
const responses = client.completionModel({ modelId: 'my-chat-deployment', api: 'responses' })
const embeddings = client.embeddingModel({ modelId: 'my-embedding-deployment' })
const images = client.imageGenerationModel({ modelId: 'my-image-deployment' })
const speech = client.speechGenerationModel({ modelId: 'my-speech-deployment' })
const transcription = client.transcriptionModel({ modelId: 'my-transcription-deployment' })
```

Use deployment names as `modelId`. `api` is optional and defaults to Chat Completions.

Known OpenAI model names retain their inferred reasoning controls and context limits. For a custom deployment name, declare them yourself and match them to the deployed model:

```ts
const model = client.completionModel({
  modelId: 'production-reasoning',
  api: 'responses',
  contextLimits: { contextWindow: 128_000, maxOutputTokens: 16_000 },
  controls: {
    reasoningEffort: {
      type: 'select',
      label: 'Reasoning effort',
      options: ['low', 'medium', 'high'],
    },
  },
})
```

For DALL-E deployments with a custom name, pass `providerOptions: { response_format: 'b64_json' }` to image generation. The shared adapter returns image bytes and does not download URL responses.

## Injected SDK clients and versioned endpoints

For older Azure APIs that require `api-version`, inject the OpenAI SDK's Azure client:

```ts
import { AzureOpenAI } from 'openai'

const client = new AzureOpenAIClient({
  client: new AzureOpenAI({
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT!}/openai`,
    apiKey: process.env.AZURE_OPENAI_API_KEY!,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
  }),
})
```

Install `openai` separately when importing the SDK directly, and choose an API version supported by the operations you use. An injected client owns endpoint, authentication, headers, transport, and retries; combining `client` with managed configuration is rejected with `AzureOpenAIClient cannot combine client with <option>.`

## Live test

The package's ordinary tests use mocked SDK calls or `fetch`. Its live Responses tool-call test makes a real provider request and runs only when `ANVIA_AZURE_OPENAI_TESTS=1`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_BASE_URL` (the full API URL), and `AZURE_OPENAI_DEPLOYMENT` are set. Use the same variables in your own smoke test of the exact deployment you ship.
