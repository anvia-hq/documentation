# Configuration

Dense and sparse factories accept parallel option shapes.

## Dense model

```ts
const dense = await createFastEmbedEmbeddingModel({
  model: 'fast-bge-base-en-v1.5',
  maxBatchSize: 64,
  initOptions: {
    cacheDir: './.cache/fastembed',
    maxLength: 512,
    showDownloadProgress: false,
    executionProviders: ['cpu'],
  },
})
```

## Sparse model

```ts
const sparse = await createFastEmbedSparseEmbeddingModel({
  model: 'prithivida/Splade_PP_en_v1',
  maxBatchSize: 64,
  initOptions: {
    cacheDir: './.cache/fastembed',
    showDownloadProgress: false,
  },
})
```

`executionProviders` uses the `ExecutionProvider` type from `fastembed`; valid values depend on the installed runtime. Do not copy an example provider into production without confirming support in the target image.

## Option behavior

- `model` selects the FastEmbed enum-backed model.
- `maxBatchSize` controls adapter batching and is clamped to an integer of at least one.
- `cacheDir` controls model asset placement.
- `maxLength` and other initialization options are passed to FastEmbed.
- `initOptions` are forwarded and the selected top-level model is also added as `model`; avoid supplying a conflicting `modelName`.

## Direct construction

Use `new FastEmbedEmbeddingModel(runtime, options)` or the sparse equivalent when the application already owns an initialized runtime or tests need a fake:

```ts
const model = new FastEmbedEmbeddingModel(runtime, {
  model: 'fast-bge-small-en-v1.5',
})
```

Direct construction does not download or initialize model assets. The supplied runtime must honor the documented async iterable shape.
