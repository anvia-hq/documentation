# Build a document analyst

**Level:** Application · **Estimated time:** 75 minutes

## Outcome

Build an upload-to-review workflow that loads text and PDF pages, extracts a typed record, and
keeps evidence and approval separate from model output.

## When to use it

Use this for contracts, tickets, forms, or reports whose output must be validated and reviewed.
For simple question answering over a corpus, use [basic RAG](/examples/knowledge-and-data/basic-rag).

## Architecture

upload quarantine → MIME/size scan → application storage read → PDF page extraction → extraction
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
import { readFile } from "node:fs/promises";
import { extractPdfText } from "@anvia/core/documents";

export async function loadDocument(path: string, mime: string) {
  const data = await readFile(path);
  if (mime === "application/pdf") {
    const { pages } = await extractPdfText({ data });
    return pages.map((page) => ({
      id: `${path}#page=${page.pageNumber}`,
      text: page.text,
      metadata: { source: path, pageNumber: page.pageNumber },
    }));
  }
  if (mime === "text/plain") {
    return [{
      id: path,
      text: data.toString("utf8"),
      metadata: { source: path },
    }];
  }
  throw new Error("Unsupported document type");
}
```

Only pass a server-resolved quarantine path. Do not let a request choose an arbitrary filesystem
path.

## Extract a typed record

```ts
// src/extraction/pipeline.ts
import { Pipeline } from "@anvia/core/pipeline";
import { OpenAIClient } from "@anvia/openai";
import { z } from "zod";

const finding = z.object({
  label: z.string(),
  value: z.string(),
  page: z.number().int().positive().nullable(),
  evidence: z.string(),
});
const report = z.object({ title: z.string(), findings: z.array(finding) });
const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! });
const model = client.completionModel({ modelId: "gpt-5.5", api: "responses" });

export const analysis = new Pipeline({
  id: "document-analysis",
  inputSchema: z.string(),
}).extract({
  id: "extract-report",
  model,
  outputSchema: report,
  instructions: "Extract only supported findings. Preserve page evidence.",
  text: ({ input }) => input,
});
```

The worker converts loaded pages into a bounded string with explicit page markers and calls
`analysis.run({ input })`. Persist `result.output` as a schema-validated draft, never as an approved fact.

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
and the source-of-truth record. PDF extraction is not a sandbox or malware scanner. Keep originals,
extracted text, and model drafts under the same access policy.

## Production changes and tests

Use object storage, checksums, idempotency keys, durable workers, per-stage status, OCR isolation,
timeouts, and audit events. Test MIME spoofing, path traversal, oversized pages, corrupted PDFs,
schema failure, duplicate jobs, cross-tenant access, review rejection, and deletion propagation.

## Runnable references

- [Document utilities](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/06_retrieval/04-documents.ts)
- [Extractor pipeline](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/05_pipelines/07-extractor-pipeline.ts)

These demonstrate the current APIs. The queue and repository boundaries are suggested architecture.

## Extensions

Add OCR, per-page retrieval, confidence review rules, a comparison workflow, source highlighting,
and evaluation fixtures with known expected fields.
