# Model listing

`listModels()` retrieves the configured endpoint's `/models` inventory and normalizes it into Anvia's `ModelList`.

```ts
const models = await openai.listModels()
```

Use the result for an internal inventory, administration view, or startup diagnostic. Listing answers whether the endpoint reports a model ID; it does not prove that the model supports streaming, tools, output schemas, reasoning, documents, or media.

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

  return openai.completionModel(modelId)
}
```

The list above is an example of application policy, not a universal recommendation. Choose and test IDs appropriate to the deployment.

## Treat listing as fallible

`listModels()` rejects with a normalized model-listing error when the provider request fails. Model inventory can also change independently of a running application. Avoid making every user request depend on a fresh listing call; cache it for administrative use and keep the production allow-list in reviewed configuration.

