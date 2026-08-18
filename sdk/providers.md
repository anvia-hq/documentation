# Providers

Provider packages adapt vendor SDKs to Anvia's runtime contracts. The application creates a provider client, asks it for a capability-specific model, and injects that model into Core.

```text
Provider client        Capability model        Anvia runtime
credentials            completionModel()       Agent
endpoint        ->      embeddingModel()  ->   generateCompletion
SDK options             transcriptionModel()   Pipeline stages
```

This boundary keeps credentials and vendor configuration out of prompts, tools, and product logic.

## 1. Install only what the application uses

```sh
pnpm add @anvia/core @anvia/openai
```

Available provider guides cover:

- [OpenAI](/sdk/providers/openai) through `@anvia/openai`
- [Anthropic](/sdk/providers/anthropic) through `@anvia/anthropic`
- [Gemini](/sdk/providers/gemini) through `@anvia/gemini`
- [Mistral](/sdk/providers/mistral) through `@anvia/mistral`
- [Grok](/packages/grok) through `@anvia/grok`
- [Compatible APIs](/sdk/providers/compatible) through an OpenAI- or Anthropic-shaped adapter

## 2. Create models at a server boundary

```ts
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

export const supportModel =
  openai.completionModel({
      modelId: 'gpt-5.6-sol',
      api: "responses"
  })
```

The returned object satisfies Anvia's `CompletionModel`. Inject it into the runtime:

```ts
import { Agent } from '@anvia/core'
import { supportModel } from './models'

export const supportAgent = new Agent({
  id: 'support',
  model: supportModel,
  instructions:
    'Answer support questions clearly and concisely.',
  maxTurns: 4,
})
```

Keep provider clients, API keys, endpoints, and custom headers in server or worker code. Browsers should call application-owned routes.

## 3. Choose a capability before a brand

A provider client may expose several independent contracts:

```ts
const chat = openai.completionModel({
    modelId: 'gpt-5.6-sol'
})
const embeddings = openai.embeddingModel({
    modelId: 'text-embedding-3-small'
})
```

A completion model cannot be used for embeddings merely because both come from one provider. It is normal to use different providers for conversation, retrieval, OCR, transcription, and evaluation.

## 4. Verify the actual configuration

Adapter capabilities describe what Anvia can map. They do not prove that every model ID, account, region, or compatible endpoint enables the same feature.

Before shipping, exercise the exact production path for streaming, tool choice, structured output, media, and provider parameters. Model listing proves inventory, not behavior.

Continue with the [model boundary](/sdk/providers/model-boundary), [provider selection](/sdk/providers/choose-a-provider), and [capability declarations](/sdk/providers/capability-matrix).
