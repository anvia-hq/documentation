# Azure OpenAI

`@anvia/azure` connects Anvia to Azure OpenAI and Azure AI Foundry endpoints. One `AzureOpenAIClient` creates provider-neutral models for completions, embeddings, image generation, speech generation, and transcription from your Azure deployments.

```ts
import { AzureOpenAIClient } from '@anvia/azure'

export const azure = new AzureOpenAIClient({
  endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
})
```

Azure owns endpoint, authentication, and deployment configuration here. Request and response mapping is shared with [`@anvia/openai`](/sdk/providers/openai), so agents, extractors, and pipelines receive the same Anvia model contracts.

## Choose a model

Use `completionModel({ modelId, api })` for agents, direct completions, tools, and structured output. `modelId` is your Azure deployment name, and `api` is `'responses'` or `'chat'` (the default).

Use `embeddingModel()`, `imageGenerationModel()`, `speechGenerationModel()`, and `transcriptionModel()` for the other capabilities, and `listModels()` for the endpoint's model list. Each needs a matching deployment, and availability depends on your Azure endpoint.

## What the provider owns

The package configures the endpoint and credentials, labels models with the `azure-openai` provider identity, adds explicit message types to Responses requests for Foundry project endpoints, and restores function names that Azure omits from terminal tool-argument stream events. The application still owns instructions, tool permissions, memory, deployment selection, credential storage, fallback policy, retries, and observability.

## Start here

1. [Install and configure the client](/sdk/providers/azure/setup), with an API key or Microsoft Entra.
2. [Create deployment models](/sdk/providers/azure/models) for completions and other capabilities.
3. Review the [production checklist](/sdk/providers/azure/production), including migration from `OpenAIClient`.

For package details, see the [`@anvia/azure` reference](/packages/azure).
