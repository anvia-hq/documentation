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
import { readFile } from "node:fs/promises";
import { chunkText, extractPdfText } from "@anvia/core/documents";

const data = await readFile(approvedPath);
const { pages } = await extractPdfText({ data });

const chunks = pages.flatMap((page) =>
  chunkText({
    text: page.text,
    strategy: "recursive",
    maxSize: 1_600,
    overlap: 200,
    separators: ["\n\n", "\n", ". ", " "],
  }).map((chunk) => ({
  id: `${sourceId}@${version}#page=${page.pageNumber}&chunk=${chunk.index}`,
  text: chunk.text,
  sourceId,
  version,
  pageNumber: page.pageNumber,
  start: chunk.start,
  end: chunk.end,
  })),
);
```

Tune `chunkText()` for the source and include the chunk number in the ID. Anvia does not infer your
document semantics, overlap policy, or versioning scheme.

## Embed and upsert

```ts
const { documents: embedded } = await embedDocuments({
    model: embeddingModel,
    documents: chunks,
    id: (chunk) => chunk.id,
    content: (chunk) => chunk.text,
    metadata: (chunk) => ({
        sourceId: chunk.sourceId,
        version: chunk.version,
        pageNumber: chunk.pageNumber,
    })
});
await store.upsert({
    documents: embedded
});
```

All RC vector stores use `store.upsert({ documents })`. Call `store.ensure()` during provisioning,
or `store.validate()` when startup must fail rather than create missing infrastructure.

## Expected behavior

Retrying the same immutable source version replaces identical IDs rather than multiplying chunks.
The job records counts and the embedding model/version. A source becomes queryable only after the
complete version is ready according to application policy.

## Failure cases

Partial upserts, corrupted PDFs, dimension changes, duplicate source IDs, changed splitters,
deleted sources, and concurrent versions require recovery plans. Record extraction failures rather
than silently creating an incomplete production corpus.

## Security and ownership

The application owns source authorization, malware scanning, file paths, licensing, PII handling,
retention, and deletion. Parsed output is untrusted. Never let a request provide an arbitrary path
or make the model decide which source version is active.

## Production changes and tests

Use a durable queue, checksums, leases, staging/active versions, bulk limits, dead-letter handling,
and deletion reconciliation. Test duplicate delivery, crash after partial upsert, parser failure,
version races, source deletion, dimension mismatch, and provenance round trips.

## Runnable references

- [Document utilities](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/04-documents.ts)
- [pgvector adapter](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/08-pgvector-store.ts)

## Extensions

Add OCR, content hashing, semantic chunking, approval workflows, ingestion metrics, and a re-embed
migration that runs old and new indexes in parallel.
