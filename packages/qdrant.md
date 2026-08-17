# @anvia/qdrant

`@anvia/qdrant` supports dense and hybrid dense-plus-sparse retrieval over Qdrant collections.

## Install

```sh
pnpm add @anvia/qdrant @anvia/core @anvia/openai @qdrant/js-client-rest
```

The ESM package includes the Qdrant REST client and should be installed with the matching `@anvia/core` release candidate.

## Dense retrieval

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { embedDocuments } from '@anvia/core/embeddings';
import { QdrantVectorClient } from '@anvia/qdrant';
import { OpenAIClient } from '@anvia/openai';
const openai = new OpenAIClient({
    apiKey: process.env.OPENAI_API_KEY!,
});
const embeddings = openai.embeddingModel({
    modelId: 'text-embedding-3-small'
});
const sourceDocuments = [
    {
        id: 'password-reset',
        text: 'Password reset links expire after 30 minutes.',
    },
];
const { documents } = await embedDocuments({
    model: embeddings,
    documents: sourceDocuments,
    id: (document) => document.id,
    content: (document) => document.text
});
const storeClient = new QdrantVectorClient();
const store = storeClient.vectorStore({
    collectionName: 'support_docs',
    dimensions: 1536,
    metric: "cosine"
});
await store.ensure();
await store.upsert({
    documents: documents
});
const results = await retrieveDocuments({
    store: store,
    model: embeddings,
    query: 'How do I reset a password?',
    topK: 5
});
```

## Hybrid retrieval

Create the collection and index in hybrid mode, then ingest documents containing aligned dense and sparse embeddings. In this example, `dense`, `sparse`, and `hybridDocuments` are produced by the SDK's hybrid embedding workflow:

```ts
const storeClient = new QdrantVectorClient();
const store = storeClient.vectorStore({
    collectionName: 'support_docs_hybrid',
    dimensions: 1536,
    mode: "hybrid"
});
await store.ensure();
await store.upsert({
    documents: hybridDocuments
});
const results = await retrieveDocuments({
    store,
    models: { dense, sparse },
    query: 'How do I reset a password?',
    topK: 5,
    fusion: 'rrf',
});
```

Hybrid collections default to named vectors `dense` and `sparse`; fusion defaults to `rrf`, with `dbsf` also supported. Dense-only and hybrid store modes cannot be mixed.

## Collection ownership

`ensure()` reads an existing collection or creates one with the configured dimension and distance. Production deployments should create collections, payload indexes, replication, and storage settings through infrastructure automation, then call `validate()` at startup.

Keys beginning with `__anvia_` are reserved in payload metadata. Keep configured dense and sparse vector names identical during creation, ingestion, and query.

## Production patterns

- Inject an authenticated Qdrant client with explicit endpoint and transport settings.
- Choose dense versus hybrid before ingesting the collection.
- Tune hybrid prefetch independently from final `topK`.
- Add payload indexes for common metadata filters.
- Treat collection or payload filters as retrieval boundaries, not application authorization.

## Reference

- [API reference](/packages/qdrant/api-reference)
- [Embeddings](/sdk/knowledges/embeddings)
- [Search tools](/sdk/knowledges/search-tools)
- [Source](https://github.com/anvia-hq/anvia/tree/v1-rc3/packages/vector-qdrant)
- [Changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-qdrant/CHANGELOG.md)
