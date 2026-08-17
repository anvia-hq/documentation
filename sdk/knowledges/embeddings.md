# Embeddings

Embeddings convert text into vectors. A vector store compares the query vector with document vectors and returns the closest matches.

Create an [embedding model](/sdk/models/embeddings) first. The model used to search an index must be compatible with the model and dimensions used to create it.

## 1. Embed application documents

`embedDocuments()` preserves each original record and adds its ID, optional metadata, and embeddings:

```ts
import { embedDocuments } from '@anvia/core/embeddings';
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: articles,
    id: (article) => article.slug,
    content: (article) => `${article.title}\n\n${article.body}`,
    metadata: (article) => ({
        title: article.title,
        product: article.product,
        published: article.status === 'published',
    })
});
```

The `content` callback selects the text sent to the embedding provider. The complete original `article` remains available as `result.document` after a search.

## 2. Create several vectors for one record

Return an array from `content()` when several passages should find the same logical document:

```ts
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: runbooks,
    id: (runbook) => runbook.id,
    content: (runbook) => runbook.sections.map((section) => section.text)
});
```

The vectors stay aligned with one document ID. Search uses the best matching vector for that record.

Create separate documents instead when each passage needs a distinct ID, source location, permission boundary, or citation.

## 3. Control ingestion concurrency

The embedding model's `maxBatchSize` controls how many texts are sent in one provider call. The `concurrency` option controls how many batches `embedDocuments()` may process at once:

```ts
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: documents,
    id: (document) => document.id,
    content: (document) => document.text,
    concurrency: 2
});
```

The default concurrency is `1`. Increase it gradually and observe provider rate limits, latency, and retry behavior.

Anvia verifies that the provider returns one vector per input text. A mismatched result count throws instead of silently attaching vectors to the wrong documents.

## 4. Design metadata for retrieval

Vector metadata is flat. Values may be strings, numbers, booleans, or `null`:

```ts
metadata: (document) => ({
  tenantId: document.tenantId,
  language: document.language,
  revision: document.revision,
  public: document.visibility === 'public',
})
```

Store the fields needed to enforce tenant, visibility, status, and product boundaries. Do not embed secrets or unnecessary personal data: filtering later does not remove sensitive text from the index.

Next, add the embedded records to a [vector store](/sdk/knowledges/vector-stores).
