# @anvia/lancedb

`@anvia/lancedb` stores Anvia embedded documents in LanceDB. It suits local-first retrieval, development, and deployments that already own a LanceDB connection.

## Install

```sh
pnpm add @anvia/lancedb @anvia/core @anvia/openai @lancedb/lancedb
```

The ESM package includes `@lancedb/lancedb` and peers with `@anvia/core >=0.7.1 <1.0.0`.

## Store and search documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'
import { LanceDBVectorStore } from '@anvia/lancedb'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})
const embeddings = openai.embeddingModel('text-embedding-3-small')
const sourceDocuments = [
  {
    id: 'password-reset',
    text: 'Password reset links expire after 30 minutes.',
    category: 'account',
  },
]

const documents = await embedDocuments(embeddings, sourceDocuments, {
  id: (document) => document.id,
  content: (document) => document.text,
  metadata: (document) => ({ category: document.category }),
})

const store = await LanceDBVectorStore.connect({
  uri: 'data/lancedb',
  tableName: 'support_docs',
  vectorSize: 1536,
})

await store.upsertDocuments(documents)

const results = await store.index(embeddings).search({
  query: 'How do I reset a password?',
  topK: 5,
})
```

If neither `client` nor `uri` is supplied, the adapter connects to `~/.anvia/lancedb`.

## Table ownership

`connect()` creates an empty table when it is missing unless `createIfMissing: false`. Production applications should supply a managed connection and own table lifecycle, indexing, backups, and optimization through their LanceDB deployment process.

The adapter writes reserved `__anvia_` columns for the logical document ID, serialized document, and vector. Metadata keys beginning with `__anvia_` are rejected. Repeated ingestion adds rows through LanceDB's `add()` API; plan deduplication and cleanup around your ingestion workflow.

## Production patterns

- Use an explicit durable URI or injected connection; do not depend on a home-directory default in containers.
- Keep `vectorSize` aligned with the embedding model.
- Provision and tune indexes outside request handling for larger datasets.
- Use stable source IDs and an intentional replace/delete strategy when refreshing a corpus.
- Monitor table growth when documents produce more than one embedding.

Learn the common workflow in [Load documents](/sdk/knowledges/load-documents) and [Vector stores](/sdk/knowledges/vector-stores).

## Reference

- [API reference](/packages/lancedb/api-reference)
- [Metadata filters](/sdk/knowledges/metadata-filters)
- [Source](https://github.com/anvia-hq/anvia/tree/main/packages/vector-lancedb)
- [Changelog](https://github.com/anvia-hq/anvia/blob/main/packages/vector-lancedb/CHANGELOG.md)
