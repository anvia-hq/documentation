# Get started

Install the local adapter with Core:

```sh
pnpm add @anvia/core @anvia/fastembed
```

The package initializes FastEmbed asynchronously because model assets and the local runtime must be prepared.

```ts
import { createFastEmbedEmbeddingModel } from '@anvia/fastembed'

const embeddings = await createFastEmbedEmbeddingModel()
const vectors = await embeddings.embedTexts([
  'Password reset links expire after thirty minutes.',
  'Enterprise customers receive priority support.',
])
```

## Build a local index

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { InMemoryVectorStore } from '@anvia/core/vector-store'

const documents = await embedDocuments(
  embeddings,
  sourceDocuments,
  {
    id: (document) => document.id,
    content: (document) => document.text,
  },
)

const store = InMemoryVectorStore.fromDocuments(documents)
const index = store.index(embeddings)
const results = await index.search({ query: 'reset link expiry', topK: 5 })
```

Use the same model and preprocessing for ingestion and querying.

## Add sparse embeddings

```ts
import { createFastEmbedSparseEmbeddingModel } from '@anvia/fastembed'

const sparse = await createFastEmbedSparseEmbeddingModel()
const [passage] = await sparse.embedTexts(['A document to index'])
const query = await sparse.embedQuery('What should I retrieve?')
```

Sparse passage and query encoding are intentionally different. See [Sparse embeddings](/packages/fastembed/sparse-embeddings).

## Before production

- Warm model downloads before serving latency-sensitive traffic.
- Put the cache on persistent storage with suitable permissions.
- Verify native runtime support in the deployment image.
- Bound concurrent embedding work to protect CPU and memory.
- Record model and vector configuration with index metadata.
- Reindex before changing model or dimensions.
