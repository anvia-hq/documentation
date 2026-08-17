# Models and parameters

Model IDs and provider-specific parameters are part of the deployment contract. Keep them explicit, versioned with application configuration, and covered by live tests.

## Use the endpoint's model ID

Pass the exact identifier expected by the compatible endpoint:

```ts
const model = compatible.completionModel({
    modelId: 'provider/model-name',
    api: 'chat',
})
```

The model-name type recognizes known OpenAI IDs while allowing custom strings for gateway aliases, namespaced IDs, local models, and newer releases. TypeScript accepting the string does not prove that the remote endpoint knows it.

## Treat listing as inventory

When the endpoint implements `/models`, `listModels()` returns a normalized list:

```ts
const inventory = await compatible.listModels()

for (const available of inventory.data) {
  console.log(available.id)
}
```

Use this for diagnostics or an allow-list workflow. Do not infer tools, media, schemas, context limits, or Responses support from presence in the list. Some compatible services omit `/models` or list models that require other APIs.

## Prefer normalized request options

Keep portable settings on the Anvia completion call:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: incidentText,
    model,
    instructions: 'Summarize the incident without speculation.',
    temperature: 0.2,
    maxTokens: 300
})

console.log(result.text)
```

Ordinary application code then remains independent of the compatible provider.

## Isolate provider-specific fields

Use `providerOptions` for endpoint fields without a normalized Anvia option:

```ts
const result = await generateCompletion({
    prompt: 'Summarize this release note.',
    model,
    providerOptions: {
        thinking: { type: 'enabled', keep: 'all' },
    }
})
```

Those fields belong to the target endpoint, not to OpenAI compatibility in general. A parameter affecting reasoning, safety, latency, cost, or output format is product behavior; keep it in typed application configuration rather than scattering it through prompts.

Because provider parameters are merged into the outgoing provider request, only pass trusted, reviewed values. Do not forward an arbitrary client-supplied object as `providerOptions`.

## Promote a tested tuple

Treat endpoint, adapter, and model as one unit:

```ts
type CompatibleDeployment = {
  baseUrl: string
  api: 'chat' | 'responses'
  model: string
}
```

Promote a known tuple between environments. Re-run compatibility tests after a provider alias, gateway route, model, adapter, or important provider parameter changes. Avoid silent model fallback because it obscures output regressions and incidents.
