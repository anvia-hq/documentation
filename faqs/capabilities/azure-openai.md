# Can I use Azure OpenAI or Azure AI Foundry?

Yes. `@anvia/azure` connects Anvia agents to Azure OpenAI and Azure AI Foundry endpoints. It owns Azure endpoint and credential configuration and reuses `@anvia/openai` for request and response mapping.

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
```

`modelId` is your Azure deployment name. `endpoint` is the resource origin; use `baseUrl` instead for a full API URL, including a Foundry project endpoint. Chat Completions is the default API.

## What does it support?

The client supports completion (Chat Completions or Responses), embeddings, image generation, text-to-speech, transcription, and model listing, where your deployment offers them. Authenticate with an `apiKey` or a Microsoft Entra `azureADTokenProvider`, or inject an existing OpenAI SDK client.

## Is it stable?

`@anvia/azure` is pre-1.0 (`0.1.12`), while Core is a stable v1 package. Pin its version and review its [releases](/packages/azure/releases) before upgrading. It does not read credentials from environment variables, enumerate Azure deployments, or provide Azure Speech adapters.

See the [Azure provider guide](/sdk/providers/azure), [configuration](/packages/azure/configuration), and [migration from `@anvia/openai`](/packages/azure/migration).

Reviewed against Anvia SDK `7aa42c0a` on 2026-11-24.
