# @anvia/lancedb

`@anvia/lancedb` stores Anvia embedded documents in LanceDB. It suits local-first retrieval, development, and deployments that already own a LanceDB connection.

## Install

```sh
pnpm add @anvia/lancedb @anvia/core @anvia/openai @lancedb/lancedb
```

The ESM package includes `@lancedb/lancedb` and should use a version compatible with its declared `@anvia/core` dependency range.

## Store and search documents

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { embedDocuments } from '@anvia/core/embeddings';
import { LanceDBVectorClient } from '@anvia/lancedb';
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
        category: 'account',
    },
];
const { documents } = await embedDocuments({
    model: embeddings,
    documents: sourceDocuments,
    id: (document) => document.id,
    content: (document) => document.text,
    metadata: (document) => ({ category: document.category })
});
const storeClient = new LanceDBVectorClient({
    uri: 'data/lancedb'
});
const store = storeClient.vectorStore({
    tableName: 'support_docs',
    dimensions: 1536
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

If neither `client` nor `uri` is supplied, the adapter connects to `~/.anvia/lancedb`.

## Table ownership

`ensure()` creates and validates a missing table. Production applications should pre-provision it, call `validate()` at startup, and own indexing, backups, and optimization through their LanceDB deployment process.

The adapter writes reserved `__anvia_` columns for the hashed row ID (`__anvia_id`), logical document ID, serialized document, JSON metadata, and vector. Metadata keys beginning with `__anvia_` are rejected. Upserting a document ID replaces its rows: the adapter deletes existing rows for those IDs before calling LanceDB's `add()`.

## Production patterns

- Use an explicit durable URI or injected connection; do not depend on a home-directory default in containers.
- Keep `dimensions` aligned with the embedding model; `validate()` checks the stored vector column against it.
- Provision and tune indexes outside request handling for larger datasets.
- Re-upserting stable source IDs replaces their rows; delete document IDs that leave the corpus explicitly.
- Monitor table growth when documents produce more than one embedding.

Learn the common workflow in [Load documents](/sdk/knowledges/load-documents) and [Vector stores](/sdk/knowledges/vector-stores).

## Reference

- [API reference](/packages/lancedb/api-reference)
- [Metadata filters](/sdk/knowledges/metadata-filters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-lancedb)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-lancedb/CHANGELOG.md)
