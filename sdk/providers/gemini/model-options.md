# Models and options

Choose a model when creating each adapter, then keep portable behavior on Anvia's normalized request fields.

## Select models explicitly

```ts
const completionModel = gemini.completionModel({
    modelId: 'gemini-2.5-flash'
})

const embeddingModel = gemini.embeddingModel({
    modelId: 'gemini-embedding-001'
})
```

Known Gemini model IDs are included for editor autocomplete, while custom strings remain valid. This lets applications use newly released or deployment-specific model IDs without waiting for a package release.

Every Gemini model factory requires an explicit ID. This keeps traces, evaluations, rollbacks, and ingestion versions reproducible.

## Use portable completion options

Prefer Anvia's normalized fields when they cover the behavior:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Summarize the deployment risk.',
    model: completionModel,
    instructions: 'Answer precisely and state uncertainty.',
    temperature: 0.2,
    maxTokens: 500
})
```

The adapter maps temperature, maximum output tokens, tools, tool choice, and output schemas to Gemini configuration.

## Pass Gemini-specific configuration

Use `providerOptions` only for Google options that have no portable Anvia field:

```ts
const result = await generateCompletion({
    prompt: 'Draft a concise release note.',
    model: completionModel,
    maxTokens: 300,
    providerOptions: {
        config: {
            topP: 0.8,
            stopSequences: ['</release-note>'],
        },
    }
})
```

Completion `providerOptions.config` is shallow-merged over the adapter's generated configuration. A provider-specific key can therefore override a normalized field after mapping. Keep these values in a narrow integration module, verify their current Google SDK names, and add a live test for every option the product depends on.

## List available models

```ts
const inventory = await gemini.listModels()

for (const model of inventory.data) {
  console.log(model.id, model.name, model.contextLength)
}
```

`listModels()` collects the configured Google endpoint's model inventory and normalizes IDs, names, descriptions, types, and input context lengths when the provider reports them. Provider failures are surfaced as an Anvia `ModelListingError` with provider and status information where available.

Use listing for an internal inventory, administration view, or deployment diagnostic. Avoid putting a live listing call on every user request.

## Listing is not capability discovery

A listed model ID does not prove support for tools, output schemas, reasoning, images, PDFs, audio, video, embeddings, image generation, or the required context size. Maintain an evaluated application allow-list instead of exposing the complete provider inventory as an unrestricted selector.

Before changing a model, test the actual workflow for task quality, tool arguments, schema validity, media handling, streaming behavior, latency, and usage reporting.
