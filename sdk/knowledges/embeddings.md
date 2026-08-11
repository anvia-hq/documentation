# Embeddings

Embeddings turn source text into vectors so a query can be matched with relevant documents.

Create an [embedding model](/sdk/models/embeddings) first. Use the same model and dimensions when indexing and querying.

## Embed documents

```ts
import { embedDocuments } from '@anvia/core/embeddings'

const embedded = await embedDocuments(embeddingModel, articles, {
  id: (article) => article.slug,
  content: (article) => `${article.title}\n${article.body}`,
  metadata: (article) => ({
    title: article.title,
    product: article.product,
    published: article.published,
  }),
})
```

The original document remains attached to each result. Metadata is stored separately so the vector store can filter before returning matches.

## Choose a chunk shape

Return several strings from `content(...)` when multiple sections should find the same logical record.

```ts
const embedded = await embedDocuments(embeddingModel, runbooks, {
  id: (runbook) => runbook.id,
  content: (runbook) =>
    runbook.sections.map((section) => section.text),
})
```

Create separate documents instead when every chunk needs its own source ID or citation.

## Control ingestion concurrency

```ts
const embedded = await embedDocuments(embeddingModel, documents, {
  id: (document) => document.id,
  content: (document) => document.text,
  concurrency: 2,
})
```

Start conservatively. Higher concurrency can shorten a backfill but may hit provider rate limits or overload a local embedding model.

## Keep sensitive data out

Use flat string, number, boolean, or `null` metadata. Store stable references instead of nested product records, and redact secrets before embedding rather than relying on prompt instructions later.
