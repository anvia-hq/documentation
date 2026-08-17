# @anvia/pgvector

`@anvia/pgvector` stores Anvia embedded documents in PostgreSQL using the pgvector extension. It is useful when relational application data and retrieval data should share one operational database.

## Install

```sh
pnpm add @anvia/pgvector @anvia/core @anvia/openai pg pgvector
```

The ESM package includes `pg` and `pgvector` and should be installed with the matching `@anvia/core` release candidate.

## Store and search documents

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { embedDocuments } from '@anvia/core/embeddings';
import { PgVectorClient } from '@anvia/pgvector';
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
        tenantId: 'acme',
    },
];
const { documents } = await embedDocuments({
    model: embeddings,
    documents: sourceDocuments,
    id: (document) => document.id,
    content: (document) => document.text,
    metadata: (document) => ({ tenantId: document.tenantId })
});
const storeClient = new PgVectorClient({
    connectionString: process.env.DATABASE_URL
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

You can inject any compatible `pg` client or pool instead of a connection string.

## Schema and index ownership

`ensure()` creates the `vector` extension and a table with ID, logical document ID, JSONB document, JSONB metadata, and the configured vector column, then validates its dimensions.

The adapter does not create an HNSW or IVFFlat index. For production:

1. Create the extension and table in a migration.
2. Add the pgvector index appropriate for the selected distance and workload.
3. Deploy the schema before the application.
4. Call `validate()` at runtime.

Use `cosine`, `l2`, or `innerProduct` consistently between the adapter and the database index.

## Production patterns

- Reuse an application-managed pool and close it through the application lifecycle.
- Validate the query plan after adding an ANN index.
- Keep table names static; the adapter validates and quotes qualified identifiers.
- Keep metadata keys outside the reserved `__anvia_` prefix.
- Design JSONB or expression indexes for metadata filters used frequently.

Read [Embeddings](/sdk/knowledges/embeddings) and [Metadata filters](/sdk/knowledges/metadata-filters) for the SDK workflow.

## Reference

- [API reference](/packages/pgvector/api-reference)
- [Vector stores](/sdk/knowledges/vector-stores)
- [Source](https://github.com/anvia-hq/anvia/tree/v1-rc3/packages/vector-pgvector)
- [Changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-pgvector/CHANGELOG.md)
