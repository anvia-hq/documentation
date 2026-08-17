# Build a document extraction pipeline

**Level:** Application

## Outcome

Build a typed invoice-extraction workflow that validates its input, safely reads a small text
document, asks a model to submit schema-conforming fields, and prints only Zod-validated JSON.
The runner reports input, file, extraction, and unexpected runtime failures separately.

**Difficulty:** Intermediate

**Estimated time:** 30 minutes

## Prerequisites

- Node.js 22 or newer
- pnpm 11 or newer
- An OpenAI API key
- A UTF-8 invoice saved as a `.txt` or `.md` file

This example extracts text that is already available. PDF parsing, OCR, and image conversion are
separate ingestion steps and are not implied by this pipeline.

## Packages

- `@anvia/core` provides `extract`, `ExtractionError`, and `Pipeline`.
- `@anvia/openai` provides the OpenAI completion model adapter.
- `zod` defines both the pipeline input contract and the structured extraction result.
- `tsx`, `typescript`, and `@types/node` run and type-check the example locally.

## Architecture and flow

```text
CLI path
  -> Zod input validation
  -> deterministic file/type/size checks
  -> UTF-8 read and empty-document check
  -> extract() submit tool + Zod result validation
  -> typed invoice object
  -> JSON output
```

`Pipeline` owns the workflow order and input type. Ordinary TypeScript owns file-system policy.
`extract()` owns the model call, required structured submission, and final schema validation.

## Project structure

```text
src/
  schema.ts    # external input and validated invoice contracts
  load.ts      # deterministic file policy
  pipeline.ts  # model and pipeline composition
  cli.ts       # process arguments, observer, and error mapping
invoice.txt
```

## Implementation

::: code-group

```ts [src/schema.ts]
import { z } from "zod";

export const DocumentInput = z.object({
  path: z.string().trim().min(1, "A document path is required."),
});

export type DocumentInputType = z.infer<typeof DocumentInput>;

export const Invoice = z.object({
  invoiceNumber: z.string().trim().min(1).nullable(),
  supplier: z.string().trim().min(1).nullable(),
  currency: z.string().regex(/^[A-Z]{3}$/).nullable(),
  amountDue: z.number().nonnegative().nullable(),
  dueDate: z.iso.date().nullable(),
  lineItems: z.array(
    z.object({
      description: z.string().trim().min(1),
      quantity: z.number().positive().nullable(),
      unitPrice: z.number().nonnegative().nullable(),
    }),
  ),
});
```

```ts [src/load.ts]
import { readFile, stat } from "node:fs/promises";
import { extname, resolve } from "node:path";
import type { DocumentInputType } from "./schema.js";

const MAX_DOCUMENT_BYTES = 1_000_000;
const ALLOWED_EXTENSIONS = new Set([".txt", ".md"]);

export class DocumentInputError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "DocumentInputError";
  }
}

export async function loadDocument(input: DocumentInputType): Promise<string> {
  const documentPath = resolve(input.path);
  if (!ALLOWED_EXTENSIONS.has(extname(documentPath).toLowerCase())) {
    throw new DocumentInputError("Only .txt and .md documents are accepted.");
  }

  try {
    const file = await stat(documentPath);
    if (!file.isFile()) throw new DocumentInputError("Path is not a regular file.");
    if (file.size > MAX_DOCUMENT_BYTES) {
      throw new DocumentInputError(`Document exceeds ${MAX_DOCUMENT_BYTES} bytes.`);
    }
    const text = await readFile(documentPath, "utf8");
    if (!text.trim()) throw new DocumentInputError("The document is empty.");
    return text;
  } catch (error) {
    if (error instanceof DocumentInputError) throw error;
    throw new DocumentInputError(`Could not read ${documentPath}.`, error);
  }
}
```

```ts [src/pipeline.ts]
import { Pipeline } from "@anvia/core/pipeline";
import { OpenAIClient } from "@anvia/openai";
import { loadDocument } from "./load.js";
import { DocumentInput, Invoice } from "./schema.js";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error("Set OPENAI_API_KEY before running this example.");

const openai = new OpenAIClient({ apiKey });
const model = openai.completionModel({ modelId: "gpt-5.5", api: "responses" });

export const invoicePipeline = new Pipeline({
  id: "invoice-extraction",
  name: "Invoice extraction",
  inputSchema: DocumentInput,
})
  .step({
    id: "read-document",
    name: "Read document",
    run: ({ input }) => loadDocument(input),
  })
  .extract({
    id: "extract-invoice",
    name: "Extract invoice fields",
    model,
    outputSchema: Invoice,
    instructions:
      "Extract stated facts only. Use null for missing scalar fields and " +
      "an empty array when no line items are present.",
    text: ({ input }) => input,
  });
```

```ts [src/cli.ts]
import { ExtractionError } from "@anvia/core/extractor";
import type { PipelineRunObserver } from "@anvia/core/pipeline";
import { z } from "zod";
import { DocumentInputError } from "./load.js";
import { invoicePipeline } from "./pipeline.js";

const observer: PipelineRunObserver = {
  onEvent(event) {
    if (event.type === "stage_failed") console.error(`Stage failed: ${event.node.label}`);
  },
};

invoicePipeline
  .run({ input: { path: process.argv[2] ?? "" }, observer })
  .then((result) => console.log(JSON.stringify(result.output, null, 2)))
  .catch((error: unknown) => {
    if (error instanceof z.ZodError) {
      console.error("Invalid pipeline input:", error.issues);
    } else if (error instanceof DocumentInputError) {
      console.error(`Document rejected: ${error.message}`);
    } else if (error instanceof ExtractionError) {
      console.error("Extraction failed after the configured retries.");
    } else {
      console.error(`Pipeline failed: ${error instanceof Error ? error.message : error}`);
    }
    process.exitCode = 1;
  });
```

:::

## Set up and run

Create an empty directory, add the packages, and create the file tree shown above:

```sh
mkdir anvia-document-extraction
cd anvia-document-extraction
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/openai zod
pnpm add --save-dev tsx typescript @types/node
export OPENAI_API_KEY="your-api-key"
```

Save this sample as `invoice.txt`:

```text
Invoice INV-2048
Supplier: Northstar Office Supply
Invoice date: 2026-08-01
Due date: 2026-08-31
Currency: USD

2 ergonomic keyboards at 125.00 each
Amount due: 250.00
```

Run the pipeline:

```sh
pnpm tsx src/cli.ts ./invoice.txt
```

You can also verify an input failure without making a model call:

```sh
pnpm tsx src/cli.ts ./invoice.pdf
```

## Expected behavior

For the sample text, the command prints a JSON object that satisfies the `Invoice` schema and
contains the invoice facts submitted by the model. Exact formatting is provider-dependent, but
the result cannot reach `console.log` unless the extractor's Zod validation succeeds.

An empty path fails the pipeline's initial Zod parse. Unsupported extensions, missing files,
directories, oversized files, and empty files fail in the read stage before any model request.
If the model omits the required structured submission or submits invalid fields, the extractor
throws `ExtractionError`. Add an explicit retry policy only after deciding the operation is safe to
repeat.

## How it works

Constructing `Pipeline` with `DocumentInput` makes runtime validation the pipeline's first
operation. The `loadDocument` step is deterministic application code, so file access policy is
not delegated to the model.

The `.extract({ model, outputSchema: Invoice, text })` stage creates a required generated `submit`
tool whose input is the Zod schema. It maps the preceding text through `text` and changes the
inferred pipeline output type to the validated invoice type. This is a
supported structured-output path for extracting facts that already exist in text; there is no
manual `JSON.parse` and no use of unvalidated model text.

`invoicePipeline.run(...)` executes the stages in order. A thrown input, step, provider, or
extractor error rejects the run. The observer reports failures from the named read and extraction
stages; initial input parsing rejects before those stages start. The outer handler maps known
failure classes to useful CLI messages.

## Production and security notes

- Resolve file access beneath an application-owned root and reject paths that escape it. The
  example resolves the supplied path but intentionally does not implement tenant-specific path
  authorization.
- Enforce upload limits at the transport layer as well as before reading. Check content type and
  actual file format; a filename extension alone is not a security boundary.
- Treat document text as untrusted input. This extractor exposes only its generated `submit`
  tool, but document content can still influence extracted values. Never let extraction output
  authorize users, trigger payments, or perform irreversible writes without application checks.
- Keep source documents and detailed provider errors out of public logs. Apply retention,
  encryption, regional processing, and redaction rules appropriate for invoice data.
- Use an OCR or parser designed for the source format before this pipeline, then pass only the
  required text. Bound model input size according to the selected model and your cost policy.
- Route exhausted extractions to a retry queue or human review. Retry only safe boundaries; do
  not rerun a larger workflow after partial side effects unless they are idempotent.
- Pin compatible package versions in production and test the schemas against representative,
  adversarial, and incomplete documents before writing extracted data to a database.

## Next steps

- Refine the schema with [structured-output schema design](/sdk/structured-output/schema-design).
- Review [extractor behavior](/sdk/structured-output/extractors) and [validation errors](/sdk/structured-output/validation-errors).
- Add run telemetry with [pipeline observers](/sdk/pipelines/runs-and-errors).
- Process multiple files with [bounded pipeline batches](/sdk/pipelines/parallel-and-batch).

## Tests and source

Unit-test the deterministic loader with missing, empty, oversized, unsupported, and path-escape
inputs. Use a fake completion model to exercise valid extraction, invalid submissions, and retry
exhaustion. Keep a small adversarial document corpus and verify the final object against business
rules before persistence or action.

- Cookbook source: [`05_pipelines/07-extractor-pipeline.ts`](https://github.com/anvia-hq/anvia/blob/v1-rc3/examples/cookbook/05_pipelines/07-extractor-pipeline.ts)
- Structured extraction source: [`03_structured_output`](https://github.com/anvia-hq/anvia/tree/v1-rc3/examples/cookbook/03_structured_output)
- Extend the ingestion boundary with OCR, malware scanning, human review, and immutable source hashes.
