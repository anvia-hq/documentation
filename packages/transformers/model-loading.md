# Model loading

`loadTransformersEmbeddingModel()` dynamically initializes a Transformers.js `feature-extraction` pipeline.

## Startup pattern

Create the model once during process initialization:

```ts
export const embeddings = await loadTransformersEmbeddingModel({
  modelId: process.env.EMBEDDING_MODEL ?? 'Xenova/all-MiniLM-L6-v2',
})
```

Do not load a new pipeline inside each request. First initialization can resolve and cache model assets, which is both slower and more resource intensive than inference on an existing pipeline.

## Runtime compatibility

Model loading, cache paths, remote asset access, native/WASM backends, and hardware acceleration are controlled by `@huggingface/transformers`. Validate the exact Node, browser, worker, or bundled target against that library and the selected model.

This package is ESM and has no browser-specific wrapper. A model working in Node does not imply that its assets, operations, or bundle size fit a browser.

## Controlled deployments

- Preload required model assets when production instances cannot access the public model registry.
- Verify model licenses and redistribution terms before baking assets into an image.
- Keep caches writable during warmup and appropriately protected afterward.
- Measure cold start independently from steady-state embedding latency.
- Avoid allowing an untrusted request to select an arbitrary model ID.

## Custom loading

When the application needs a custom pipeline wrapper, initialize it and pass the compatible extractor to `adaptTransformersEmbeddingModel({ runtime, modelId, ... })`. The application then owns loading failures and cleanup.
