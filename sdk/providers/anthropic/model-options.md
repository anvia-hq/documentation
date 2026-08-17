# Model options

Choose the model when creating the completion adapter, then keep common generation settings on the Anvia request.

## Select a model explicitly

```ts
const model = anthropic.completionModel({
    modelId: 'claude-sonnet-4-20250514'
})
```

Known Anthropic model IDs are included for editor autocomplete, while custom strings remain valid. This allows newly released models and compatible endpoints without waiting for a package release.

Avoid relying on the package default. An explicit model ID makes deployments, eval results, and rollbacks reproducible.

## List direct API models

```ts
const inventory = await anthropic.listModels()

for (const model of inventory.data) {
  console.log(model.id)
}
```

Use model listing for an admin inventory or selection UI. A listed ID does not prove that it supports tools, media, reasoning, or the context limits required by the workflow.

`AnthropicVertexClient` does not have `listModels()` because Vertex AI does not expose Anthropic's Models API.

## Set portable request options

Use Anvia's normalized request fields whenever they cover the behavior:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: 'Summarize the deployment risk.',
    model,
    instructions: 'Answer precisely and state uncertainty.',
    temperature: 0.2,
    maxTokens: 600
})
```

`temperature`, `maxTokens`, tools, and tool choice are mapped to Anthropic request fields by the adapter. Keeping them normalized makes the calling code easier to move between providers.

## Pass Anthropic-specific parameters

Use `providerOptions` only for an Anthropic Messages API option that has no Anvia field:

```ts
const result = await generateCompletion({
    prompt: 'Draft a release note.',
    model,
    maxTokens: 400,
    providerOptions: {
        top_p: 0.9,
        stop_sequences: ['</release-note>'],
    }
})
```

The adapter forwards these values to the provider request. They are provider-specific and may override normalized fields when the same provider key is supplied. Keep them in the model integration layer, type-check their shape against Anthropic's SDK, and add a live test for every parameter the application depends on.

## Choose by workload

Select and evaluate a model against the actual job rather than a name alone:

- Test tool selection and argument accuracy for agents.
- Test source fidelity for image and PDF understanding.
- Measure latency and token usage for the expected prompt size.
- Verify the required context and output limits through model metadata and live requests.
- Pin an exact model ID when behavior must remain stable.

Record the selected provider and model in traces so regressions can be compared across model changes.
