# Model listing

`listModels()` retrieves the configured endpoint's `/models` inventory and normalizes it into Anvia's `ModelList`.

```ts
const models = await openai.listModels()
```

Use the result for an internal inventory, administration view, or startup diagnostic. Listing answers whether the endpoint reports a model ID; it does not prove that the model supports streaming, tools, output schemas, reasoning, documents, or media.

## Read advertised metadata

`ModelList.data` contains `ListedModel` entries from `@anvia/core/model-listing`. In addition to `id` and the normalized name, timestamp, owner, and context-length fields, `OpenAIClient.listModels()` preserves metadata the endpoint advertises:

| Field | Upstream field | Shape |
| --- | --- | --- |
| `supportedParameters` | `supported_parameters` | `string[]`; omitted unless every entry is a string |
| `reasoning` | `reasoning` | Provider-specific object, passed through unchanged |
| `pricing` | `pricing` | Provider-specific object, passed through unchanged |

Parameter names are provider-defined, not Anvia option names. `reasoning` and `pricing` are not normalized or schema-validated below the object level: field names, value types, and units vary by service, so validate them before using them for controls, routing, or cost estimates. Fields the endpoint does not return are omitted; treat a missing field as unknown, not as evidence that the model lacks it.

Advertised metadata is inventory, not an availability or capability guarantee. A listed parameter can still be rejected by the account, region, deployment, or selected API, and advertised pricing is not a billing contract. Keep the production allow-list, capability checks, and cost policy in reviewed configuration, and smoke-test the exact endpoint and model.

## Keep selection controlled

Do not expose the complete provider inventory as an unrestricted user-controlled model selector. Prefer an application allow-list whose entries have been tested for a concrete workflow:

```ts
const allowedModels = new Set([
  'gpt-5',
  'gpt-5-mini',
])

export function selectCompletionModel(modelId: string) {
  if (!allowedModels.has(modelId)) {
    throw new Error('Unsupported model selection')
  }

  return openai.completionModel({
      modelId: modelId,
      api: 'responses'
  })
}
```

The list above is an example of application policy, not a universal recommendation. Choose and test IDs appropriate to the deployment.

## Treat listing as fallible

`listModels()` rejects with a normalized model-listing error when the provider request fails. Model inventory can also change independently of a running application. Avoid making every user request depend on a fresh listing call; cache it for administrative use and keep the production allow-list in reviewed configuration.

