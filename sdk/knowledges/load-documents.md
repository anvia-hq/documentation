# Load documents

Loaders turn files and bytes into `Document` values for ingestion. Run them in build jobs, imports, startup tasks, or background workers—not on every prompt.

## Load text files

```ts
import {
  FileLoader,
  fileLoaderToDocuments,
} from '@anvia/core/loaders'

const documents = await fileLoaderToDocuments(
  FileLoader
    .withGlob('content/support/**/*.md')
    .readWithPath()
    .ignoreErrors(),
)
```

`readWithPath()` preserves the source path. The resulting document uses that path as its ID and stores it in `additionalProps.source`.

Use `withDir(...)` for direct children of one directory. It does not recurse.

## Load PDFs

Page-level documents are usually easier to retrieve and cite than a whole PDF.

```ts
import {
  PdfFileLoader,
  pdfPageLoaderToDocuments,
} from '@anvia/core/loaders'

const pages = await pdfPageLoaderToDocuments(
  PdfFileLoader
    .withGlob('manuals/**/*.pdf')
    .readWithPath()
    .byPage()
    .ignoreErrors(),
)
```

Each page includes its source, media type, and zero-based page number. Use `pdfLoaderToDocuments(...)` only when each PDF is small enough to retrieve as one document.

## Chunk large sources

Core loaders preserve files or PDF pages; application code decides how arbitrary text is chunked. `splitIntoSections` is not an Anvia export—the example below defines a small helper for Markdown files.

```ts
function splitIntoSections(text: string): string[] {
  // ponytail: Markdown headings only; use a token-aware chunker for oversized sections.
  return text
    .split(/\n(?=#{1,6}\s)/)
    .map((section) => section.trim())
    .filter(Boolean)
}

const chunks = documents.flatMap((document) =>
  splitIntoSections(document.text).map((text, index) => ({
    id: `${document.id}#section=${index}`,
    text,
    source: document.additionalProps?.source ?? document.id,
  })),
)
```

Keep chunk IDs stable so a later ingestion run can replace changed content without leaving duplicates.

## Handle failed sources

Without `.ignoreErrors()`, loaders yield `LoaderResult` values so an import can report each failure. Skipping unreadable files is convenient for backfills, but production jobs should still make missing knowledge visible.
