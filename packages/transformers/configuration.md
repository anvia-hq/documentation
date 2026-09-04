# Configuration

```ts
const embeddings = await loadTransformersEmbeddingModel({
  modelId: 'Xenova/all-MiniLM-L6-v2',
  pooling: 'mean',
  normalize: true,
  maxBatchSize: 16,
})
```

## Options

| Option | Default | Effect |
| --- | --- | --- |
| `modelId` | Required; `DEFAULT_TRANSFORMERS_EMBEDDING_MODEL` exports `Xenova/all-MiniLM-L6-v2` as the recommended default | Model passed to the feature-extraction pipeline. Omitting it or passing an empty value throws a `TypeError`. |
| `pooling` | `'mean'` | Chooses mean or CLS output pooling. |
| `normalize` | `true` | Requests normalized vectors from the pipeline. |
| `maxBatchSize` | `16` | Exposed batch-size metadata. Values below 1 (or non-integers) throw `TypeError: maxBatchSize must be a positive safe integer`; the adapter does not clamp. |

The current `embedTexts()` implementation calls the extractor once with the full `texts` array. `maxBatchSize` is part of the Anvia model contract but does not split that call inside this adapter. If strict batching is required, split input in application code or inject a pipeline that owns batching.

## Inject a pipeline

```ts
const embeddings = adaptTransformersEmbeddingModel({
  runtime: extractor,
  modelId: 'company/model',
  pooling: 'cls',
  normalize: true,
})
```

The extractor must accept `(texts, { pooling, normalize })` and resolve an object whose `tolist()` returns the vectors. Adapting it does not load a model.

## Index compatibility

Pooling and normalization are part of vector semantics. Store them with the model ID in collection metadata. Do not query an index created with mean-normalized output using CLS or unnormalized output.
