# Model catalog

A Studio model catalog lets developers select a completion model per run without rebuilding or mutating the registered agent. Use it to compare providers, advertise supported input modalities, and restrict which models each agent may run.

Without a catalog, Studio simply uses the completion model already configured on the agent.

## Register providers

Each provider needs an ID and a factory that turns a model ID into an Anvia completion model:

```ts
import { AnthropicClient } from '@anvia/anthropic'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

new Studio([agent], {
  models: {
    default: 'openai:gpt-5.6-luna',
    providers: [
      {
        id: 'openai',
        name: 'OpenAI',
        createCompletionModel: (model) => openai.completionModel(model),
        listModels: () => openai.listModels(),
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        createCompletionModel: (model) => anthropic.completionModel(model),
        listModels: () => anthropic.listModels(),
      },
    ],
  },
}).start()
```

A model reference has the form `provider:model`. Provider IDs must be non-empty and cannot contain `:`. Model IDs must be non-empty and may contain additional colons.

Provider IDs must be unique. Static model IDs must also be unique within their provider. Studio rejects duplicate provider or static model IDs while creating the runtime.

## Describe known models

Add static definitions for the models you want to describe precisely in Studio:

```ts
{
  id: 'openai',
  name: 'OpenAI',
  defaultModel: 'gpt-5.6-luna',
  createCompletionModel: (model) => openai.completionModel(model),
  listModels: () => openai.listModels(),
  models: [
    {
      id: 'gpt-5.6-luna',
      name: 'GPT-5.6 Luna',
      description: 'General-purpose model for interactive development.',
      modalities: {
        input: ['text', 'image', 'document'],
        output: ['text'],
      },
      capabilities: {
        streaming: true,
        tools: true,
        imageInput: true,
        documentInput: true,
        outputSchema: true,
        reasoning: true,
      },
      metadata: {
        tier: 'development',
      },
    },
  ],
}
```

Static definitions can include:

| Field | Purpose |
| --- | --- |
| `name` and `description` | Human-readable catalog labels. |
| `modalities.input` | Declared text, image, document, audio, or video input support. |
| `modalities.output` | Declared output modalities. |
| `capabilities` | Completion capabilities such as streaming, tools, structured output, or reasoning. |
| `metadata` | Additional JSON-compatible provider or application data. |

The declarations inform Studio's catalog and development warnings; they do not add capabilities to the provider model. For example, declaring image input does not make a text-only provider accept images.

## Combine static and provider catalogs

`listModels` is optional. When present, Studio calls it while serving catalog requests and merges the returned models with the static definitions.

Static definitions are useful for curated names, modalities, and capabilities. Provider listing is useful for discovering models that were not hard-coded into the Studio configuration. When the same model appears in both, the static definition supplies the curated fields while provider listing can contribute metadata such as ownership, creation time, and context length.

If `listModels` fails, Studio keeps the static entries and returns a provider warning. This makes the catalog partially usable while still exposing the discovery failure.

## Set defaults and allowed models

Configure a global default and optionally override it per agent:

```ts
new Studio([supportAgent, researchAgent], {
  models: {
    default: 'openai:gpt-5.6-luna',
    providers: [openaiProvider, anthropicProvider],
    agents: {
      'support': {
        default: 'openai:gpt-5.6-luna',
        allowed: [
          'openai:gpt-5.6-luna',
          'anthropic:claude-opus-4-8',
        ],
      },
      'research': {
        allowed: ['anthropic:*'],
      },
    },
  },
})
```

| Policy | Behavior |
| --- | --- |
| Global `default` | Used when the request, session, and agent policy do not select a model. |
| Agent `default` | Overrides the global default for that agent. |
| Agent `allowed` | Limits selection to exact references or provider wildcards such as `anthropic:*`. |

Without `allowed`, an agent may select any model from a registered provider. An empty `allowed` array allows none. Policy keys must match registered agent IDs, including any duplicate suffix inferred by Studio.

The provider-level `defaultModel` describes that provider in the catalog. It is not another run-selection fallback; configure the global or agent `default` when Studio should select a model automatically.

::: warning Keep defaults inside the policy
Studio normalizes defaults and allowed entries, but it does not require an agent default to appear in its `allowed` list during startup. Configure them consistently so the default is not rejected when the agent runs.
:::

## How a run selects its model

Studio resolves a model for every agent run in this order:

```text
request model
    ↓
model saved in session metadata
    ↓
agent default
    ↓
global default
    ↓
agent's original model
```

The first four choices are catalog model references. If none exists, Studio leaves the registered agent's original model unchanged.

When a catalog model is selected, Studio validates the provider and agent policy, asks the provider factory to create the model on first use, caches it by full reference, and runs a clone of the agent with that model. The registered agent itself is not mutated.

For a persisted session, a successful selection is saved as `studioModel` metadata. That is why a later run in the same session can reuse the choice when no request model is sent.

See [Models and attachments](/studio/playground/models-and-attachments) for selecting a model in the Playground or supplying the `model` field over HTTP.

## Understand warnings and errors

Studio treats compatibility metadata and policy violations differently:

| Situation | Result |
| --- | --- |
| Reference does not use `provider:model` | The run is rejected as a bad request. |
| Provider is not registered | The run is rejected as a bad request. |
| Model is outside the agent's `allowed` policy | The run is rejected as a bad request. |
| Image or document input is not declared by the static model | The run continues and Studio records a model warning. |
| Streaming is requested while `streaming` is declared `false` | The run continues and Studio records a model warning. |
| Provider factory rejects an unknown model ID | The provider error fails the run. |
| Live model listing fails | Static catalog entries remain available with a provider warning. |

An exact model in `allowed` can appear in the agent's catalog even when it was not returned by `listModels`. The provider factory is still the final authority on whether that model ID can actually run.

Use restrictive policies when a model would be unsafe, unavailable, or too costly for a particular agent. Use modality and capability declarations to explain expected compatibility, then confirm it with representative Playground runs and [trace inspection](/studio/traces/inspect-a-trace).
