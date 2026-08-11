# Providers

Provider packages connect Anvia's runtime contracts to model vendors. Your application creates a provider client, asks it for a capability-specific model, and passes that model into an agent, completion, extractor, or pipeline.

```text
Provider client          Model object                 Runtime
credentials              one capability              product behavior
endpoint          ──→     completionModel(...)   ──→     AgentBuilder
SDK configuration        embeddingModel(...)         createCompletion
                         transcriptionModel(...)     pipelines
```

This boundary keeps credentials and vendor configuration out of prompts, tools, and product code.

## Start here

| Page | Use it to |
| --- | --- |
| [Model boundary](/sdk/providers/model-boundary) | Understand what the client, model, and runtime each own. |
| [Choose a provider](/sdk/providers/choose-a-provider) | Turn workflow requirements into a provider shortlist. |
| [Capability matrix](/sdk/providers/capability-matrix) | Compare the capabilities exposed by current Anvia adapters. |

Then open the guide for the provider you selected:

| Provider | Anvia package | Best starting point |
| --- | --- | --- |
| [OpenAI](/sdk/providers/openai) | `@anvia/openai` | Completions plus a broad set of embedding and media models. |
| [Anthropic](/sdk/providers/anthropic) | `@anvia/anthropic` | Claude completions through Anthropic or Vertex AI. |
| [Gemini](/sdk/providers/gemini) | `@anvia/gemini` | Gemini API or Vertex AI, including embeddings and media capabilities. |
| [Mistral](/sdk/providers/mistral) | `@anvia/mistral` | Completions, embeddings, and OCR. |
| [Grok](https://anvia.dev/docs/providers/grok) | `@anvia/grok` | xAI completions, live search, media generation, and transcription. |
| [Compatible APIs](/sdk/providers/compatible) | OpenAI or Anthropic adapter | Endpoints that intentionally implement one of those API shapes. |

## The common setup

Install Core and only the provider packages the application uses:

```sh
pnpm add @anvia/core @anvia/openai
```

Create the client in a server-only module:

```ts
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const supportModel = openai.completionModel('gpt-5')
```

The result is an Anvia `CompletionModel`. The rest of the workflow does not need the provider SDK:

```ts
import { AgentBuilder } from '@anvia/core'
import { supportModel } from './models'

export const supportAgent = new AgentBuilder('support', supportModel)
  .instructions('Answer support questions clearly and concisely.')
  .defaultMaxTurns(4)
  .build()
```

Keep API keys, endpoints, headers, and provider SDK clients on the server or in workers. A browser should call an application-owned route or stream endpoint.

## Capabilities are more important than brands

A provider package may expose several model factories, and each factory represents a different contract. A completion model cannot be used as an embedding model merely because both come from the same provider.

```ts
const chat = openai.completionModel('gpt-5')
const embeddings = openai.embeddingModel('text-embedding-3-small')
```

Choose the capability first, then evaluate providers and exact model IDs. It is normal for one application to use different providers for chat, embeddings, OCR, or evaluation.

## Adapter support is not model support

The [capability matrix](/sdk/providers/capability-matrix) describes what each Anvia adapter can represent. It does not guarantee that every model ID, account, region, or custom endpoint supports the same request.

Before shipping, exercise the actual configuration your workflow depends on: streaming, tool choice, structured output, media input, and any provider-specific parameters. Model listing is useful for inventory, but it is not proof of those capabilities.

