# Model options

Choose the model when creating the completion adapter, then keep common generation settings on the Anvia request.

## Select a model explicitly

```ts
const model = anthropic.completionModel({
    modelId: 'claude-sonnet-5'
})

const deepAgentModel = anthropic.completionModel({
    modelId: 'claude-opus-5'
})
```

Use Claude Sonnet 5 for the default balance of speed and intelligence. Evaluate Claude Opus 5 for long-running agents and complex coding or enterprise work where its additional capability justifies the latency and cost.

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
    maxTokens: 600
})
```

`maxTokens`, tools, and tool choice are mapped to Anthropic request fields by the adapter. Claude Sonnet 5 and Claude Opus 5 use adaptive thinking; avoid non-default `temperature`, `top_p`, and `top_k` values because these model generations reject manual sampling changes.

Reasoning-capable Anthropic models also advertise a typed `reasoningEffort` control. Inspect `model.controls` for the allowed values, then pass `controls: { reasoningEffort: 'high' }` on the completion or Agent run. Invalid values are rejected before the provider call.

The factory also accepts `controls`, which replaces the model-derived control set, and `contextLimits`, which overrides the built-in limits-table entry for the selected model ID; a custom or newly released ID has no table entry, so pass `contextLimits` when it needs context-usage accounting.

## Pass Anthropic-specific parameters

Use `providerOptions` only for an Anthropic Messages API option that has no Anvia field:

```ts
const result = await generateCompletion({
    prompt: 'Draft a release note.',
    model,
    maxTokens: 400,
    providerOptions: {
        stop_sequences: ['</release-note>'],
    }
})
```

The adapter spreads these values into the request first and then applies its normalized fields, so `model`, `max_tokens`, `messages`, and `tools` always win over a matching provider key, and `system`, `temperature`, `tool_choice`, and the reasoning `effort` value win whenever the normalized request supplies them. Keys the adapter never sets, such as `stop_sequences`, pass through unchanged. Keep them in the model integration layer, type-check their shape against Anthropic's SDK, and add a live test for every parameter the application depends on.

## Choose by workload

Select and evaluate a model against the actual job rather than a name alone:

- Test tool selection and argument accuracy for agents.
- Test source fidelity for image and PDF understanding.
- Measure latency and token usage for the expected prompt size.
- Verify the required context and output limits through model metadata and live requests.
- Pin an exact model ID when behavior must remain stable.

Record the selected provider and model in traces so regressions can be compared across model changes.
