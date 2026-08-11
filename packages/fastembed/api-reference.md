# `@anvia/fastembed` API reference

Import every public symbol from `@anvia/fastembed`. The package has no public subpath exports.

The model-name aliases and initialization options refer to types from the installed FastEmbed runtime:

```ts
import {
  EmbeddingModel,
  type ExecutionProvider,
  SparseEmbeddingModel,
} from 'fastembed'
```

Those three supporting symbols are not re-exported by `@anvia/fastembed`.

## Dense embeddings

```ts
type FastEmbedEmbeddingModelName =
  `${Exclude<EmbeddingModel, EmbeddingModel.CUSTOM>}`

type FastEmbedRuntime = {
  embed(texts: string[], batchSize?: number): AsyncIterable<unknown>
}

type FastEmbedEmbeddingModelOptions = {
  model?: FastEmbedEmbeddingModelName
  maxBatchSize?: number
  initOptions?: {
    executionProviders?: ExecutionProvider[]
    maxLength?: number
    cacheDir?: string
    showDownloadProgress?: boolean
    modelName?: string
  }
}

const DEFAULT_FASTEMBED_EMBEDDING_MODEL: FastEmbedEmbeddingModelName

class FastEmbedEmbeddingModel implements EmbeddingModel {
  readonly model: string
  readonly maxBatchSize: number

  constructor(
    runtime: FastEmbedRuntime,
    options?: FastEmbedEmbeddingModelOptions,
  )

  static create(
    options?: FastEmbedEmbeddingModelOptions,
  ): Promise<FastEmbedEmbeddingModel>

  embedTexts(texts: string[]): Promise<Embedding[]>
}

function createFastEmbedEmbeddingModel(
  options?: FastEmbedEmbeddingModelOptions,
): Promise<FastEmbedEmbeddingModel>
```

At runtime, `DEFAULT_FASTEMBED_EMBEDDING_MODEL` is `fast-bge-small-en-v1.5`. The model-name type is derived from the installed FastEmbed `EmbeddingModel` enum rather than copied into this package.

`FastEmbedEmbeddingModel.create()` initializes FastEmbed’s `TextEmbedding`; the standalone factory calls that static method. Direct construction accepts an already initialized compatible runtime. `embedTexts()` rejects invalid vectors or a count that differs from the input count.

## Sparse embeddings

```ts
type FastEmbedSparseEmbeddingModelName =
  `${Exclude<SparseEmbeddingModel, SparseEmbeddingModel.CUSTOM>}`

type FastEmbedSparseRuntime = {
  passageEmbed(
    texts: string[],
    batchSize?: number,
  ): AsyncIterable<unknown>

  queryEmbed(query: string): Promise<unknown>
}

type FastEmbedSparseEmbeddingModelOptions = {
  model?: FastEmbedSparseEmbeddingModelName
  maxBatchSize?: number
  initOptions?: {
    executionProviders?: ExecutionProvider[]
    maxLength?: number
    cacheDir?: string
    showDownloadProgress?: boolean
    modelName?: string
  }
}

const DEFAULT_FASTEMBED_SPARSE_EMBEDDING_MODEL: FastEmbedSparseEmbeddingModelName

class FastEmbedSparseEmbeddingModel implements SparseEmbeddingModel {
  readonly model: string
  readonly maxBatchSize: number

  constructor(
    runtime: FastEmbedSparseRuntime,
    options?: FastEmbedSparseEmbeddingModelOptions,
  )

  static create(
    options?: FastEmbedSparseEmbeddingModelOptions,
  ): Promise<FastEmbedSparseEmbeddingModel>

  embedTexts(texts: string[]): Promise<SparseEmbedding[]>
  embedQuery(query: string): Promise<SparseEmbedding>
}

function createFastEmbedSparseEmbeddingModel(
  options?: FastEmbedSparseEmbeddingModelOptions,
): Promise<FastEmbedSparseEmbeddingModel>
```

At runtime, `DEFAULT_FASTEMBED_SPARSE_EMBEDDING_MODEL` is `prithivida/Splade_PP_en_v1`. The static and standalone factories initialize FastEmbed’s sparse runtime. `embedTexts()` uses passage encoding; `embedQuery()` uses query encoding.

## Runtime output behavior

Dense vectors normalize to Anvia `Embedding` values. Sparse vectors preserve the runtime’s parallel `indices` and `values` arrays in Anvia `SparseEmbedding` values. The adapters validate the returned container shapes, numeric entries, matching sparse-array lengths, and final embedding count.
