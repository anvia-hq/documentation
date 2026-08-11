# `@anvia/fastembed`

FastEmbed provides local dense and sparse embedding models for Anvia retrieval workflows. Use it when embeddings should run in your own process instead of crossing a provider API, or when hybrid retrieval needs SPLADE++ sparse vectors.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.3.0` |
| Runtime | ESM, Node.js with FastEmbed native runtime support |
| Peer | `@anvia/core >=0.7.1 <1.0.0` |

## Install

```bash
pnpm add @anvia/fastembed @anvia/core
```

`fastembed` is already a runtime dependency of the adapter. Model files are downloaded and cached by FastEmbed when first initialized.

## Create local embeddings

```ts
import { createFastEmbedEmbeddingModel } from '@anvia/fastembed'

const embeddings = await createFastEmbedEmbeddingModel()
const vectors = await embeddings.embedTexts([
  'Password reset links expire after 30 minutes.',
  'Enterprise customers receive priority support.',
])

console.log(vectors[0].vector)
```

## Capabilities

| Capability | Factory | Default model |
| --- | --- | --- |
| Dense embeddings | `createFastEmbedEmbeddingModel()` | `fast-bge-small-en-v1.5` |
| Sparse passage embeddings | `createFastEmbedSparseEmbeddingModel()` | `prithivida/Splade_PP_en_v1` |
| Sparse query embeddings | `FastEmbedSparseEmbeddingModel.embedQuery()` | Same sparse model |
| Remote provider call | No | Runs locally |

Sparse passage and query encoders are intentionally separate methods. Use them with a hybrid-capable store such as Qdrant; do not substitute passage encoding for query encoding.

## Common patterns

### Choose another dense model

```ts
const embeddings = await createFastEmbedEmbeddingModel({
  model: 'fast-bge-base-en-v1.5',
  maxBatchSize: 32,
  initOptions: {
    cacheDir: './.cache/fastembed',
    showDownloadProgress: false,
  },
})
```

### Add sparse vectors for hybrid search

```ts
import { createFastEmbedSparseEmbeddingModel } from '@anvia/fastembed'

const sparse = await createFastEmbedSparseEmbeddingModel()
const [passage] = await sparse.embedTexts(['A document to index'])
const query = await sparse.embedQuery('What should I retrieve?')
```

Use the same dense model, sparse model, and preprocessing rules for ingestion and retrieval. Changing models can change vector dimensions or meaning and usually requires reindexing.

## Compatibility

`@anvia/fastembed` wraps the `fastembed` package and exposes small runtime interfaces for dependency injection and testing. Availability of native execution providers depends on the target operating system and FastEmbed runtime. This adapter is intended for Node.js/server workloads rather than browser delivery.

## Continue

- [API reference](/packages/fastembed/api-reference)
- [Embeddings guide](/sdk/knowledges/embeddings)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/embedding-fastembed/CHANGELOG.md)

