# Build a document analyst

**Level:** Application · **Estimated time:** 75 minutes

## Outcome

Build an upload-to-review workflow that loads text and PDF pages, extracts a typed record, and
keeps evidence and approval separate from model output.

## When to use it

Use this for contracts, tickets, forms, or reports whose output must be validated and reviewed.
For simple question answering over a corpus, use [basic RAG](/examples/knowledge-and-data/basic-rag).

## Architecture

upload quarantine → MIME/size scan → `FileLoader` or `PdfFileLoader` → page documents → extraction
pipeline → Zod validation → review queue → approved record.

```text
src/
  ingestion/load.ts
  extraction/schema.ts
  extraction/pipeline.ts
  storage/repository.ts
  workers/analyze.ts
  server.ts
test/fixtures/  test/analyze.test.ts
```

## Setup

```sh
pnpm add @anvia/core @anvia/openai zod
```

## Load application-approved files

```ts
// src/ingestion/load.ts
import {
  FileLoader,
  fileLoaderToDocuments,
  PdfFileLoader,
  pdfPageLoaderToDocuments,
} from "@anvia/core/loaders";

export async function loadDocument(path: string, mime: string) {
  if (mime === "application/pdf") {
    return pdfPageLoaderToDocuments(
      PdfFileLoader.withGlob(path).readWithPath().byPage(),
    );
  }
  if (mime === "text/plain") {
    return fileLoaderToDocuments(FileLoader.withGlob(path).readWithPath());
  }
  throw new Error("Unsupported document type");
}
```

Only pass a server-resolved quarantine path. Do not give a user glob or filesystem path to a
loader.

## Extract a typed record

```ts
// src/extraction/pipeline.ts
import { ExtractorBuilder } from "@anvia/core/extractor";
import { PipelineBuilder } from "@anvia/core/pipeline";
import { OpenAIClient } from "@anvia/openai";
import { z } from "zod";

const finding = z.object({
  label: z.string(),
  value: z.string(),
  page: z.number().int().positive().nullable(),
  evidence: z.string(),
});
const report = z.object({ title: z.string(), findings: z.array(finding) });
const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY });
const extractor = new ExtractorBuilder(client.completionModel("gpt-5.5"), report)
  .instructions("Extract only supported findings. Preserve page evidence.")
  .build();

export const analysis = new PipelineBuilder(z.string())
  .extract(extractor)
  .build();
```

The worker converts loaded pages into a bounded string with explicit page markers and calls
`analysis.run(input)`. Persist the schema-validated result as a draft, never as an approved fact.

## Run and expected behavior

Upload a supported fixture, enqueue its immutable object ID, and let a worker analyze it. The draft
contains typed findings with page evidence. Unsupported types fail before loading; a malformed
model response fails schema validation; approval is a separate authenticated action.

## Failure cases

- Encrypted, corrupted, or image-only PDFs require a product decision or OCR path.
- Very large documents must be chunked; never silently truncate without recording it.
- Duplicate delivery must not create duplicate approved records.
- Prompt injection inside a document cannot authorize tools or change reviewer policy.

## Security and ownership

The application owns upload scanning, tenancy, encryption, retention, deletion, reviewer roles,
and the source-of-truth record. Loaders parse approved files; they are not a sandbox or malware
scanner. Keep originals, extracted text, and model drafts under the same access policy.

## Production changes and tests

Use object storage, checksums, idempotency keys, durable workers, per-stage status, OCR isolation,
timeouts, and audit events. Test MIME spoofing, path traversal, oversized pages, corrupted PDFs,
schema failure, duplicate jobs, cross-tenant access, review rejection, and deletion propagation.

## Runnable references

- [Document loaders](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/04-document-loaders.ts)
- [Extractor pipeline](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/05_pipelines/07-extractor-pipeline.ts)

These demonstrate the current APIs. The queue and repository boundaries are suggested architecture.

## Extensions

Add OCR, per-page retrieval, confidence review rules, a comparison workflow, source highlighting,
and evaluation fixtures with known expected fields.
