# `@anvia/fastembed` API reference

Import all public symbols from `@anvia/fastembed`.

```ts
import {
  adaptFastEmbedEmbeddingModel,
  adaptFastEmbedSparseEmbeddingModel,
  DEFAULT_FASTEMBED_EMBEDDING_MODEL,
  DEFAULT_FASTEMBED_SPARSE_EMBEDDING_MODEL,
  loadFastEmbedEmbeddingModel,
  loadFastEmbedSparseEmbeddingModel,
  type AdaptFastEmbedEmbeddingModelOptions,
  type AdaptFastEmbedSparseEmbeddingModelOptions,
  type ExecutionProvider,
  type FastEmbedEmbeddingModelHandle,
  type FastEmbedEmbeddingModelId,
  type FastEmbedRuntime,
  type FastEmbedSparseEmbeddingModelHandle,
  type FastEmbedSparseEmbeddingModelId,
  type FastEmbedSparseRuntime,
  type LoadFastEmbedEmbeddingModelOptions,
  type LoadFastEmbedSparseEmbeddingModelOptions,
} from '@anvia/fastembed'
```

## Load models

```ts
function loadFastEmbedEmbeddingModel(
  options: LoadFastEmbedEmbeddingModelOptions,
): Promise<FastEmbedEmbeddingModelHandle>

function loadFastEmbedSparseEmbeddingModel(
  options: LoadFastEmbedSparseEmbeddingModelOptions,
): Promise<FastEmbedSparseEmbeddingModelHandle>
```

Both option types require `modelId` and also accept `executionProviders`, `maxLength`, `cacheDir`, `showDownloadProgress`, and `maxBatchSize`.

```ts
const DEFAULT_FASTEMBED_EMBEDDING_MODEL: FastEmbedEmbeddingModelId
const DEFAULT_FASTEMBED_SPARSE_EMBEDDING_MODEL: FastEmbedSparseEmbeddingModelId
```

## Adapt existing runtimes

```ts
function adaptFastEmbedEmbeddingModel(
  options: {
    runtime: FastEmbedRuntime
    modelId: string
    maxBatchSize?: number
  },
): FastEmbedEmbeddingModelHandle

function adaptFastEmbedSparseEmbeddingModel(
  options: {
    runtime: FastEmbedSparseRuntime
    modelId: string
    maxBatchSize?: number
  },
): FastEmbedSparseEmbeddingModelHandle
```

## Runtime contracts

```ts
type FastEmbedRuntime = {
  embed(texts: string[], batchSize?: number): AsyncIterable<unknown>
}

type FastEmbedSparseRuntime = {
  passageEmbed(texts: string[], batchSize?: number): AsyncIterable<unknown>
  queryEmbed(query: string): Promise<unknown>
}
```

Dense handles implement `EmbeddingModel`. Sparse handles implement `SparseEmbeddingModel`, using passage encoding for `embedTexts()` and query encoding for `embedQuery()`.
