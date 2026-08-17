# Configuration

Dense and sparse factories accept parallel option shapes.

## Dense model

```ts
const dense = await loadFastEmbedEmbeddingModel({
  modelId: 'fast-bge-base-en-v1.5',
  maxBatchSize: 64,
  cacheDir: './.cache/fastembed',
  maxLength: 512,
  showDownloadProgress: false,
  executionProviders: ['cpu'],
})
```

## Sparse model

```ts
const sparse = await loadFastEmbedSparseEmbeddingModel({
  modelId: 'prithivida/Splade_PP_en_v1',
  maxBatchSize: 64,
  cacheDir: './.cache/fastembed',
  showDownloadProgress: false,
})
```

`executionProviders` uses the `ExecutionProvider` type from `fastembed`; valid values depend on the installed runtime. Do not copy an example provider into production without confirming support in the target image.

## Option behavior

- `modelId` selects the FastEmbed enum-backed model.
- `maxBatchSize` controls adapter batching and is clamped to an integer of at least one.
- `cacheDir` controls model asset placement.
- `maxLength` and other initialization options are passed to FastEmbed.

## Direct construction

Use the adapter functions when the application already owns an initialized runtime or tests need a fake:

```ts
import { adaptFastEmbedEmbeddingModel } from '@anvia/fastembed'

const model = adaptFastEmbedEmbeddingModel({
  runtime,
  modelId: 'fast-bge-small-en-v1.5',
})
```

Direct construction does not download or initialize model assets. The supplied runtime must honor the documented async iterable shape.
