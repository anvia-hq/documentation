# `@anvia/transformers` API reference

Import every public symbol from `@anvia/transformers`. The package has no public subpath exports.

## Types

```ts
type TransformersPooling = 'mean' | 'cls'

type TransformersFeatureExtractionPipeline = (
  texts: string[],
  options: {
    pooling: TransformersPooling
    normalize: boolean
  },
) => Promise<{
  tolist(): unknown
}>

type TransformersEmbeddingModelOptions = {
  model?: string
  pooling?: TransformersPooling
  normalize?: boolean
  maxBatchSize?: number
}
```

`TransformersFeatureExtractionPipeline` is the minimum public contract accepted by direct model construction. It allows an official Transformers.js pipeline, wrapper, or test double to be injected.

## Constant

```ts
const DEFAULT_TRANSFORMERS_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
```

## `TransformersEmbeddingModel`

```ts
class TransformersEmbeddingModel implements EmbeddingModel {
  readonly model: string
  readonly maxBatchSize: number

  constructor(
    extractor: TransformersFeatureExtractionPipeline,
    options?: TransformersEmbeddingModelOptions,
  )

  static create(
    options?: TransformersEmbeddingModelOptions,
  ): Promise<TransformersEmbeddingModel>

  embedTexts(texts: string[]): Promise<Embedding[]>
}
```

`create()` loads a Transformers.js `feature-extraction` pipeline using `options.model` or the default. Pooling defaults to `mean`, normalization defaults to `true`, and the adapter batches according to `maxBatchSize`.

Direct construction uses the supplied extractor without loading a model. `embedTexts()` converts `tolist()` output into Anvia embeddings and rejects malformed vectors or a vector count that differs from the input count.

## Factory

```ts
function createTransformersEmbeddingModel(
  options?: TransformersEmbeddingModelOptions,
): Promise<TransformersEmbeddingModel>
```

The factory is a convenience wrapper around `TransformersEmbeddingModel.create(options)` and returns a fully initialized model.
