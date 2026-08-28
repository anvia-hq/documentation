# Load and chunk documents

Core chunks normalized text; it does not parse files. Your application owns file discovery, storage
reads, document parsing or OCR, source IDs, and error handling. Run ingestion in a script, worker,
or deployment job—not on every agent request.

## 1. Read application-approved text

Use the file, object-storage, or database API appropriate for your application. For example, a Node.js worker can read a path it resolved from a trusted source:

```ts
import { readFile } from 'node:fs/promises'

const path = 'content/support/reset-links.md'
const text = await readFile(path, 'utf8')
const document = {
  id: path,
  text,
  metadata: { source: path, mediaType: 'text/markdown' },
}
```

Do not accept an arbitrary filesystem path or glob from a request. File discovery, access control, retries, and skipped-file reporting belong to the ingestion job.

## 2. Normalize parser output

Choose a parser or OCR service in the application layer, then convert its output into Core's shared
text-document shape. Keep page or section provenance in metadata when it matters for citations:

```ts
import type { TextDocument } from '@anvia/core/documents'

const documents: TextDocument[] = [
  {
    id: 'manuals/setup.pdf#page=1',
    text: 'Text returned by the application-selected parser.',
    metadata: {
      source: 'manuals/setup.pdf',
      mediaType: 'application/pdf',
      pageNumber: 1,
    },
  },
]
```

Image-only PDFs need OCR before they can be indexed. Treat source bytes and parsed text as untrusted
input. Apply authorization, size limits, malware scanning, timeouts, and cancellation around the
application-owned parser. For one-off analysis, a capable provider can instead receive a
[PDF attachment](/sdk/messages/documents) directly.

## 3. Chunk normalized documents

`chunkTextDocuments()` accepts the shared `{ id, text, metadata? }` document shape and creates
stable `${documentId}:chunk:${index}` IDs. Without `chunking`, or with `{ strategy: 'none' }`, every
document produces one chunk.

```ts
import { chunkTextDocuments } from '@anvia/core/documents'

const chunks = chunkTextDocuments({
  documents,
  chunking: {
    strategy: 'recursive',
    maxSize: 1_600,
    overlap: 200,
    separators: ['\n\n', '\n', '. ', ' '],
  },
})
```

Use this shared helper when the next stage needs explicit chunks. The vector and graph ingestion
helpers call it internally.

## 4. Chunk one text value manually

Use `chunkText()` with either a fixed-width or recursive separator strategy. Keep chunk IDs stable so a later ingestion run replaces the same records:

```ts
import { chunkText } from '@anvia/core/documents'

const chunks = documents.flatMap((document) =>
  chunkText({
    text: document.text,
    strategy: 'recursive',
    maxSize: 1_600,
    overlap: 200,
    separators: ['\n\n', '\n', '. ', ' '],
  }).map((chunk) => ({
    id: `${document.id}#chunk=${chunk.index}`,
    text: chunk.text,
    metadata: {
      ...document.metadata,
      parentId: document.id,
      start: chunk.start,
      end: chunk.end,
    },
  })),
)
```

`chunkText()` measures JavaScript string length, not model tokens. Choose boundaries and limits that fit the content and embedding model you use.

## 5. Continue to ingestion

Use `ingestVectorText()` or `ingestVectorDocuments()` to chunk, embed, and upsert raw text through
one consistent path. Use `ingestGraphText()` or `ingestGraphDocuments()` with a managed knowledge
graph. Continue with [vector stores](/sdk/knowledges/vector-stores),
[Knowledge GraphRAG](/sdk/knowledges/graph-rag), or the lower-level
[embedding helpers](/sdk/knowledges/embeddings).
