# Model listing

`listModels()` fetches the model inventory visible to the configured Mistral client and normalizes it to Anvia's `ModelList`.

```ts
const models = await mistral.listModels()

for (const model of models.data) {
  console.log(model.id)
  console.log(model.name)
  console.log(model.contextLength)
}
```

Every normalized entry has an `id`. When supplied by Mistral, it can also include a name, description, type, creation time, owner, and context length.

Use model listing for administration, inventory, or deployment diagnostics. A listed ID is not proof that it supports a workflow's tools, schemas, context size, OCR, or embedding configuration.

## Keep selection controlled

Do not turn the complete provider inventory into an unrestricted user-controlled selector. Keep a reviewed application allow-list:

```ts
const allowedModels = new Set([
  'mistral-large-latest',
  'mistral-small-latest',
])

export function selectCompletionModel(modelId: string) {
  if (!allowedModels.has(modelId)) {
    throw new Error('Unsupported model selection')
  }

  return mistral.completionModel({
      modelId: modelId
  })
}
```

These IDs illustrate application policy, not a universal recommendation. Select and test models for the deployment's quality, latency, cost, account, and endpoint requirements.

## Treat inventory as fallible

Listing can fail, change independently of the application, or include models inappropriate for the current workflow. Provider failures are converted to an Anvia `ModelListingError` that includes the provider name and an available status code.

Avoid making every user request depend on a fresh listing call. Cache inventory for administrative views and keep production model selection in reviewed configuration.
