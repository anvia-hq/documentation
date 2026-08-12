# Build a document ingestion pipeline

**Level:** Pattern · **Estimated time:** 45 minutes

## Outcome

Turn approved text and PDF files into stable, replaceable vector documents with source and page
provenance. Ingestion runs as an application job, not inside an answer request.

## When to use it

Use this whenever knowledge changes independently from questions. Direct startup ingestion is fine
only for small demonstrations.

## Flow

source event → validate and scan → load pages → normalize/chunk → stable IDs → embed → upsert →
mark source version active → delete stale IDs.

## Setup

```sh
pnpm add @anvia/core @anvia/transformers @anvia/pgvector
```

## Load and normalize

```ts
import { PdfFileLoader, pdfPageLoaderToDocuments } from "@anvia/core/loaders";

const pages = await pdfPageLoaderToDocuments(
  PdfFileLoader.withGlob(approvedPath).readWithPath().byPage(),
);

const chunks = pages.map((page) => ({
  id: `${sourceId}@${version}#page=${page.additionalProps?.pageNumber ?? 0}`,
  text: page.text,
  sourceId,
  version,
  pageNumber: page.additionalProps?.pageNumber ?? null,
}));
```

For long pages, use an application-owned splitter and include the chunk number in the ID. Anvia
does not infer your document semantics, overlap policy, or versioning scheme.

## Embed and upsert

```ts
const embedded = await embedDocuments(embeddingModel, chunks, {
  id: (chunk) => chunk.id,
  content: (chunk) => chunk.text,
  metadata: (chunk) => ({
    sourceId: chunk.sourceId,
    version: chunk.version,
    pageNumber: chunk.pageNumber,
  }),
});

await store.upsertDocuments(embedded);
```

`upsertDocuments` is the durable-adapter shape demonstrated by Chroma, Qdrant, pgvector, and other
adapters. The local `InMemoryVectorStore` instead uses synchronous `addDocuments(...)`.

## Expected behavior

Retrying the same immutable source version replaces identical IDs rather than multiplying chunks.
The job records counts and the embedding model/version. A source becomes queryable only after the
complete version is ready according to application policy.

## Failure cases

Partial upserts, corrupted PDFs, dimension changes, duplicate source IDs, changed splitters,
deleted sources, and concurrent versions require recovery plans. `ignoreErrors()` is convenient for
exploration but can silently create incomplete production corpora unless failures are recorded.

## Security and ownership

The application owns source authorization, malware scanning, file paths, licensing, PII handling,
retention, and deletion. Loader output is untrusted. Never let a request provide an arbitrary glob
or make the model decide which source version is active.

## Production changes and tests

Use a durable queue, checksums, leases, staging/active versions, bulk limits, dead-letter handling,
and deletion reconciliation. Test duplicate delivery, crash after partial upsert, parser failure,
version races, source deletion, dimension mismatch, and provenance round trips.

## Runnable references

- [Document loaders](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/04-document-loaders.ts)
- [pgvector adapter](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/08-pgvector-store.ts)

## Extensions

Add OCR, content hashing, semantic chunking, approval workflows, ingestion metrics, and a re-embed
migration that runs old and new indexes in parallel.
