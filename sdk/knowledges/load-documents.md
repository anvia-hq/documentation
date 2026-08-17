# Load and chunk documents

Anvia RC keeps document parsing deliberately small: the core package extracts PDF text and chunks text, while your application owns file discovery, storage reads, source IDs, and error handling. Run ingestion in a script, worker, or deployment job—not on every agent request.

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

## 2. Extract PDF pages

`extractPdfText()` accepts PDF bytes and returns one text value per page. Page numbers are one-based:

```ts
import { readFile } from 'node:fs/promises'
import { extractPdfText } from '@anvia/core/documents'

const path = 'manuals/setup.pdf'
const data = await readFile(path)
const { pages } = await extractPdfText({ data })

const documents = pages.map((page) => ({
  id: `${path}#page=${page.pageNumber}`,
  text: page.text,
  metadata: {
    source: path,
    mediaType: 'application/pdf',
    pageNumber: page.pageNumber,
  },
}))
```

Image-only PDFs need OCR before they can be indexed. Treat PDF bytes as untrusted input and apply size limits, malware scanning, timeouts, and cancellation outside the parser.

## 3. Chunk long text

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

## 4. Continue to embeddings

Pass the normalized values to `embedDocuments()` using `id`, `content`, and `metadata` selectors, then upsert the returned embedded documents into a vector store. See [create embeddings](/sdk/knowledges/embeddings).
