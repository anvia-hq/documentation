# Model listing

`JevClient` implements Anvia's `ModelListingClient`.

```ts
const { data } = await jev.listModels()

for (const model of data) {
  console.log(model.id, model.description, model.type)
}
```

Each SDK model maps to a listed model with `id` and `name` set to the SDK model name, plus `description` and `type: 'decision'`.

```ts
const controller = new AbortController()
const { data } = await jev.listModels({ abortSignal: controller.signal })
```

## Errors

Invalid metadata from the SDK, or an SDK failure, is reported as `ModelListingError` with `provider: 'jev'` and the original error as `cause`. A caller abort rejects with an `AbortError` instead.

Model listing is inventory, not a capability test. Run a small [decision](/sdk/providers/jev/decisions) against the exact model ID before depending on it. Keep user-selectable model IDs behind an application allow-list.
