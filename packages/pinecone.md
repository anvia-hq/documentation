# @anvia/pinecone

`@anvia/pinecone` stores Anvia embedded documents in Pinecone and presents a provider-neutral vector-search interface to agents and retrieval code.

## Install

```sh
pnpm add @anvia/pinecone @anvia/core @anvia/openai @pinecone-database/pinecone
```

The ESM package includes the Pinecone SDK and should be installed with the matching `@anvia/core` release candidate.

## Store and search documents

```ts
import { retrieveDocuments } from "@anvia/core/vector-store";
import { embedDocuments } from '@anvia/core/embeddings';
import { PineconeVectorClient } from '@anvia/pinecone';
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
const storeClient = new PineconeVectorClient({});
const store = storeClient.vectorStore({
    indexName: 'support-docs',
    namespace: 'production',
    dimensions: embeddings.dimensions!
});
await store.validate();
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

Without an injected client, the adapter creates the standard Pinecone client, which uses the SDK's normal credential configuration.

## Index and namespace ownership

Use a pre-provisioned Pinecone index in production. Set its dimension to the embedding model's output size and use the same metric configured for retrieval. `ensure()` creates a missing index only when `vectorStore({ spec, dimensions, ... })` supplies explicit provisioning data; provider region, capacity, and lifecycle still belong in infrastructure configuration.

The default namespace is the empty string. Use stable namespaces to isolate corpora when that matches the application's data model. Namespace or metadata filtering is not a replacement for authorization.

Metadata keys starting with `__anvia_` are reserved for document reconstruction and are rejected during ingestion.

## Production patterns

- Provision indexes through infrastructure automation and call `validate()` at startup.
- Inject a configured client when credential and retry settings are centrally managed.
- Keep embedding dimension and metric consistent for the lifetime of an index.
- Use deterministic document IDs for repeatable upserts.
- Plan namespace and metadata cardinality before ingesting tenant-scoped data.

## Reference

- [API reference](/packages/pinecone/api-reference)
- [Vector stores](/sdk/knowledges/vector-stores)
- [Automatic retrieval](/sdk/knowledges/automatic-retrieval)
- [Source](https://github.com/anvia-hq/anvia/tree/v1-rc3/packages/vector-pinecone)
- [Changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/vector-pinecone/CHANGELOG.md)
