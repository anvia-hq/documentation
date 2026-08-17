# `@anvia/transformers` API reference

Import all public symbols from `@anvia/transformers`.

```ts
import {
  adaptTransformersEmbeddingModel,
  DEFAULT_TRANSFORMERS_EMBEDDING_MODEL,
  loadTransformersEmbeddingModel,
  type AdaptTransformersEmbeddingModelOptions,
  type LoadedTransformersEmbeddingModel,
  type LoadTransformersEmbeddingModelOptions,
  type TransformersEmbeddingModelHandle,
  type TransformersFeatureExtractionPipeline,
  type TransformersPooling,
  type TransformersTensor,
} from '@anvia/transformers'
```

## Load a model

```ts
function loadTransformersEmbeddingModel(
  options: LoadTransformersEmbeddingModelOptions,
): Promise<LoadedTransformersEmbeddingModel>
```

```ts
type LoadTransformersEmbeddingModelOptions = {
  modelId: string
  pooling?: 'mean' | 'cls'
  normalize?: boolean
  maxBatchSize?: number
  device?: string | Record<string, string>
  dtype?: string | Record<string, string>
  cacheDir?: string
  localFilesOnly?: boolean
  revision?: string
}
```

`LoadedTransformersEmbeddingModel` implements `EmbeddingModel` and `AsyncDisposable`; call `close()` or use `await using` to release the owned pipeline.

## Adapt an existing pipeline

```ts
function adaptTransformersEmbeddingModel(
  options: AdaptTransformersEmbeddingModelOptions,
): TransformersEmbeddingModelHandle

type AdaptTransformersEmbeddingModelOptions = {
  runtime: TransformersFeatureExtractionPipeline
  modelId: string
  pooling?: 'mean' | 'cls'
  normalize?: boolean
  maxBatchSize?: number
}
```

An adapted model does not own or dispose the supplied runtime.

## Runtime contracts

```ts
type TransformersTensor = {
  tolist(): unknown
  dispose(): void
}

type TransformersFeatureExtractionPipeline = {
  (
    texts: string[],
    options: { pooling: TransformersPooling; normalize: boolean },
  ): Promise<TransformersTensor>
  dispose(): Promise<void>
}
```

```ts
const DEFAULT_TRANSFORMERS_EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2'
```
