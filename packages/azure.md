# `@anvia/azure`

The Azure provider adapter connects Anvia agents to Azure OpenAI and Azure AI Foundry endpoints. It owns Azure endpoint and credential configuration, provider identity, and Azure Responses stream normalization, and reuses `@anvia/openai` for request and response mapping.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.1.0` |
| Runtime | ESM, server-side JavaScript |
| Peer | Matching `@anvia/core` stable release |
| Depends on | `@anvia/openai`, official `openai` SDK |

## Install

```bash
pnpm add @anvia/azure @anvia/core
```

## Create an Azure agent

```ts
import { Agent } from '@anvia/core'
import { AzureOpenAIClient } from '@anvia/azure'

const client = new AzureOpenAIClient({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})

const agent = new Agent({
  id: 'assistant',
  model: client.completionModel({
    modelId: process.env.AZURE_OPENAI_DEPLOYMENT!,
    api: 'responses',
  }),
})

const result = await agent.generate({ prompt: 'Hello!' })

if (result.type === 'response') {
  console.log(result.output)
}
```

`endpoint` is the resource origin, such as `https://example.openai.azure.com`; the client appends `/openai/v1/`. Use `baseUrl` instead for a full API URL, including a Foundry project endpoint. `modelId` is your Azure deployment name, not necessarily the underlying model name. `api` is optional and defaults to Chat Completions; pass `api: 'responses'` for the Responses API.

## Capabilities

| Capability | Factory | Default |
| --- | --- | --- |
| Streaming completion | `completionModel({ modelId, api? })` | Deployment name; Chat Completions |
| Dense embeddings | `embeddingModel({ modelId })` | Deployment name |
| Image generation | `imageGenerationModel({ modelId })` | Deployment name |
| Text-to-speech | `speechGenerationModel({ modelId })` | Deployment name |
| Transcription | `transcriptionModel({ modelId })` | Deployment name |
| Model inventory | `listModels()` | Endpoint model list |

Availability of APIs, tools, media options, and model listing depends on your Azure endpoint and deployment. Handles and listing errors identify the provider as `azure-openai`; request traces use `azure-openai-chat` or `azure-openai-responses`.

## Authentication

Pass exactly one credential:

- `apiKey`, a non-empty Azure key.
- `azureADTokenProvider`, an asynchronous function that returns a Microsoft Entra bearer token, such as the result of `getBearerTokenProvider` from `@azure/identity`.

Alternatively, inject an existing OpenAI SDK client with `client`, for example the SDK's `AzureOpenAI` client for versioned endpoints that need `api-version`. See [Configuration](/packages/azure/configuration).

## Compatibility

`@anvia/azure` is an ESM package. The managed client targets the Azure v1 API, which does not require an `api-version` query parameter, and disables SDK retries so Anvia owns retry policy. Azure Responses requests tag conversation messages with `type: "message"` for Foundry project endpoints, and the Azure Responses stream normalizer resolves a function name that Azure omits from the terminal tool-argument event.

The package does not select credentials or endpoints from environment variables, enumerate Azure Resource Manager deployments, or provide AI SDK-style file-ID prefix inference, hosted-tool helpers, or Azure Speech and MAI adapters.

## Continue

- [Get started](/packages/azure/get-started)
- [Capabilities](/packages/azure/capabilities)
- [Configuration](/packages/azure/configuration)
- [Migrate from `@anvia/openai`](/packages/azure/migration)
- [API reference](/packages/azure/api-reference)
- [Releases](/packages/azure/releases)
- [Azure SDK guide](/sdk/providers/azure)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/provider-azure/CHANGELOG.md)
