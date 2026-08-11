# Models and parameters

Model IDs and provider-specific parameters are part of the deployment contract. Keep them explicit, versioned with application configuration, and covered by live tests.

## Use the endpoint's model ID

Pass the exact identifier expected by the compatible endpoint:

```ts
const model = compatible.completionModel(
  'provider/model-name',
)
```

Anvia's model-name type offers autocomplete for known OpenAI IDs while still accepting custom strings. This supports gateway aliases, namespaced IDs, local model names, and new releases without waiting for an Anvia package update.

TypeScript accepting a string does not prove that the remote endpoint knows it. Fail fast when the configured value is absent, then verify it with a real request.

## Model listing is inventory

When the endpoint implements the compatible `/models` route, `listModels()` returns a normalized model list:

```ts
const inventory = await compatible.listModels()

for (const available of inventory.data) {
  console.log(available.id)
}
```

Use this for diagnostics or an allow-list workflow. Do not infer tools, media, schemas, context limits, or Responses support from presence in the list. Some compatible services omit `/models` entirely or expose models that require different APIs.

## Prefer normalized request fields

Keep portable settings on the Anvia completion request:

```ts
import { createCompletion } from '@anvia/core'

const result = await createCompletion(model, {
  instructions: 'Summarize the incident without speculation.',
  input: incidentText,
  temperature: 0.2,
  maxTokens: 300,
})

console.log(result.text)
```

This keeps ordinary application code independent of the compatible provider.

## Isolate provider parameters

Use `params` for endpoint-specific request fields that have no normalized Anvia option:

```ts
const result = await createCompletion(model, {
  input: 'Summarize this release note.',
  params: {
    thinking: { type: 'enabled', keep: 'all' },
  },
})
```

The accepted fields belong to the target endpoint, not to OpenAI compatibility in general. Check its documentation and test the exact request. A parameter affecting reasoning, safety, latency, cost, or output format is product behavior; keep it in typed application configuration rather than scattering it through prompts.

## Pin and promote configurations

Treat this tuple as one tested unit:

```ts
type CompatibleDeployment = {
  baseUrl: string
  completionApi: 'chat' | 'responses'
  model: string
}
```

Promote a known tuple between environments. Re-run compatibility tests when the provider changes an alias, the gateway route changes, the model is upgraded, or the adapter selection changes. Avoid a silent fallback to another model because it makes output regressions and incident diagnosis harder.

