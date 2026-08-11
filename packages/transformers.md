# `@anvia/transformers`

Transformers.js provides local dense embeddings through Hugging Face feature-extraction pipelines. It is a compact choice for development and lightweight retrieval workflows that should not call a remote embedding API.

| | |
| --- | --- |
| Support | First-party |
| Version | `0.2.11` |
| Runtime | ESM, runtimes supported by Transformers.js |
| Peer | `@anvia/core >=0.7.1 <1.0.0` |

## Install

```bash
pnpm add @anvia/transformers @anvia/core
```

`@huggingface/transformers` is a runtime dependency of the adapter. Model assets are resolved by Transformers.js when the model is first initialized.

## Create local embeddings

```ts
import { createTransformersEmbeddingModel } from '@anvia/transformers'

const embeddings = await createTransformersEmbeddingModel()
const vectors = await embeddings.embedTexts([
  'Password reset links expire after 30 minutes.',
  'Enterprise customers receive priority support.',
])

console.log(vectors[0].vector)
```

## Capabilities

| Capability | Support |
| --- | --- |
| Dense text embeddings | Yes |
| Configurable model | Any compatible feature-extraction model |
| Pooling | `mean` or `cls` |
| Normalization | Configurable, enabled by default |
| Sparse embeddings | No |
| Remote provider call | No; inference runs through Transformers.js |

## Common patterns

### Configure the feature extractor

```ts
const embeddings = await createTransformersEmbeddingModel({
  model: 'Xenova/all-MiniLM-L6-v2',
  pooling: 'mean',
  normalize: true,
  maxBatchSize: 16,
})
```

### Inject a pipeline

```ts
import { TransformersEmbeddingModel } from '@anvia/transformers'

const embeddings = new TransformersEmbeddingModel(featureExtractionPipeline, {
  model: 'my-local-model',
  pooling: 'cls',
  normalize: true,
})
```

Direct construction is useful when the application owns model loading or tests need a deterministic pipeline. For ordinary use, prefer the async factory.

Use the same model, pooling, normalization, and preprocessing for ingestion and query embeddings. A change to any of them usually requires rebuilding the vector index.

## Compatibility

`@anvia/transformers` is ESM and uses `@huggingface/transformers`. The chosen model must support the `feature-extraction` task and return one numeric vector per input. Runtime support, model caching, and hardware acceleration follow Transformers.js.

## Continue

- [API reference](/packages/transformers/api-reference)
- [Embeddings guide](/sdk/knowledges/embeddings)
- [Source changelog](https://github.com/anvia-hq/anvia/blob/main/packages/embedding-transformers/CHANGELOG.md)

