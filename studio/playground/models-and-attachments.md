# Models and attachments

Configure a Studio model catalog when you want to compare providers, constrain which models an agent may use, or test image and document input from the Playground. The selected model applies to the next run without changing the original agent instance.

## Register model providers

Each provider tells Studio how to construct a completion model. Static model definitions give the UI readable names and capability metadata; `listModels` can supplement them with the provider’s live catalog.

```ts
import { AnthropicClient } from '@anvia/anthropic'
import { Agent } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const openai = new OpenAIClient({
  baseUrl: process.env.OPENAI_BASEURL,
  apiKey: process.env.OPENAI_API_KEY!,
})

const anthropic = new AnthropicClient({
  baseUrl: process.env.ANTHROPIC_BASEURL,
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const agent = new Agent({
  id: 'model-router',
  model: openai.completionModel({
      modelId: 'gpt-5.6-luna',
      api: "chat"
  }),
  name: 'Model Router',
  instructions: 'Answer clearly and concisely.',
})

new Studio([agent], {
  models: {
    defaultModelRef: {
      providerId: 'openai',
      modelId: 'gpt-5.6-luna',
    },
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        defaultModelId: 'gpt-5.6-luna',
        createCompletionModel: ({ modelId }) => openai.completionModel({
            modelId,
            api: 'chat',
        }),
        listModels: () => openai.listModels(),
        models: [
          {
            id: 'gpt-5.6-luna',
            modalities: {
              input: ['text', 'image', 'document'],
              output: ['text'],
            },
            capabilities: {
              streaming: true,
              tools: true,
              imageInput: true,
              documentInput: true,
            },
          },
        ],
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        defaultModelId: 'claude-opus-4-8',
        createCompletionModel: ({ modelId }) => anthropic.completionModel({
            modelId,
        }),
        listModels: () => anthropic.listModels(),
      },
    ],
    agents: {
      'model-router': {
        defaultModelRef: {
          providerId: 'openai',
          modelId: 'gpt-5.6-luna',
        },
        allowed: [
          { providerId: 'openai', modelId: 'gpt-5.6-luna' },
          { providerId: 'anthropic', modelId: 'claude-opus-4-8' },
        ],
      },
    },
  },
}).start({ port: 4021 })
```

A configuration model reference uses `{ providerId, modelId }`. The HTTP runtime and session metadata serialize it in `provider:model` format. Provider IDs cannot contain `:`; model IDs may contain it.

## Control model access per agent

The `agents` policy controls what appears in the Playground selector:

| Option | Effect |
| --- | --- |
| `defaultModelRef` | Selects the initial model for that agent. |
| `allowed` | Limits the catalog to exact `{ providerId, modelId }` references or provider wildcards such as `openai:*`. |

Without `allowed`, the agent can select any model exposed by the registered providers. An unknown or disallowed model is rejected at the run boundary rather than silently falling back.

When Studio runs a selected model, it clones the agent with that completion model for the request. The agent you originally registered is not mutated.

## Select a model per run

The model selector appears in the composer when the selected agent has available catalog entries. You can change it between runs, but not while a run is active.

For a new chat, Studio also saves the initial selection in the session metadata. Every Playground request sends the current selection explicitly, so changing the selector affects the next run in the same session.

If you call Studio’s HTTP runtime yourself, send the same reference in `model`:

```json
{
  "message": "Summarize the attached incident report.",
  "model": "anthropic:claude-opus-4-8",
  "stream": true
}
```

The runtime resolves selection in this order: request model, saved session model, agent default, then global default. If none is configured, the agent’s original completion model is used.

## Attach images and documents

Select the paperclip in the composer and choose one or more files. Studio currently accepts:

| Input | File extensions |
| --- | --- |
| Images | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif` |
| Documents | `.pdf`, `.txt`, `.md`, `.csv`, `.json` |

Images become `image` content and all other supported files become `document` content. Studio reads each file in the browser and sends it as base64 content with the user message. Attachments are also shown on the user entry in the transcript.

You may send attachments without accompanying text. Remove an attachment from the composer before sending if it was selected accidentally.

::: warning Provider limits still apply
The Playground validates the file type, not the provider’s payload-size, file-count, or format limits. Make sure the selected completion model actually supports the attachment modality. Declared model metadata lets Studio record a warning when a run includes an undeclared image or document modality, but the provider remains the final authority and may reject the request.
:::

Return to the [Playground overview](/studio/playground), or learn how to pause sensitive tool calls with [approvals and questions](/studio/playground/approvals-and-questions).
