# Model listing

`listModels()` fetches the model inventory visible to the configured Mistral client and normalizes it to Anvia's `ModelList`.

```ts
const models = await mistral.listModels()

for (const model of models.data) {
  console.log(model.id, model.contextLength)
}
```

Use listing for administration, inventory, or deployment diagnostics. A listed ID is not proof that it supports the workflow's tools, schemas, context size, OCR, or embedding configuration.

## Keep selection controlled

Do not expose the complete provider inventory as an unrestricted user-controlled model selector. Keep a reviewed application allow-list:

```ts
const allowedModels = new Set([
  'mistral-large-latest',
  'mistral-small-latest',
])

export function selectCompletionModel(modelId: string) {
  if (!allowedModels.has(modelId)) {
    throw new Error('Unsupported model selection')
  }

  return mistral.completionModel(modelId)
}
```

These IDs illustrate application policy, not a universal recommendation. Select and test model IDs for the deployment's quality, latency, cost, account, and endpoint requirements.

## Treat inventory as fallible

Provider listing can fail, change independently of the application, or include models inappropriate for a given workflow. `listModels()` converts provider failures to an Anvia model-listing error with provider and available status information.

Avoid making every user request depend on a fresh listing call. Cache inventory for administrative views and keep production selection in reviewed configuration.
