# Get started

Install the adapter with Core:

```sh
pnpm add @anvia/core @anvia/transformers
```

Initialize a local Transformers.js feature-extraction pipeline:

```ts
import { DEFAULT_TRANSFORMERS_EMBEDDING_MODEL, loadTransformersEmbeddingModel } from '@anvia/transformers'

const embeddings = await loadTransformersEmbeddingModel({ modelId: DEFAULT_TRANSFORMERS_EMBEDDING_MODEL })
const vectors = await embeddings.embedTexts([
  'Password reset links expire after thirty minutes.',
  'Enterprise customers receive priority support.',
])
```

The default is `Xenova/all-MiniLM-L6-v2` with mean pooling, normalization, and a batch-size metadata value of 16.

## Use with a vector store

```ts
import { embedDocuments } from '@anvia/core/embeddings';
import { InMemoryVectorStore, retrieveDocuments } from '@anvia/core/vector-store';
const { documents: embedded } = await embedDocuments({
    model: embeddings,
    documents: documents,
    id: (document) => document.id,
    content: (document) => document.text
});
const store = InMemoryVectorStore.fromDocuments({ documents: embedded });
const results = await retrieveDocuments({
    store,
    model: embeddings,
    query: 'priority support',
    topK: 5
});
```

## Before production

- Warm model loading and cache assets.
- Verify the selected model supports `feature-extraction`.
- Keep model, pooling, and normalization identical for indexing and querying.
- Rebuild the index after any of those values changes.
- Measure local CPU, memory, startup, and request latency.
- Add application concurrency limits where needed.
