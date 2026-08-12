# Generate images

**Type:** Recipe

## Outcome

Generate a PNG through Anvia's provider-neutral image request and save its bytes to disk. Use this
for server-side asset generation where prompts and outputs pass your product's safety policy.

## Prerequisites

- Node.js 22 or newer
- `@anvia/core`, `@anvia/openai`, `tsx`, and a server-side `OPENAI_API_KEY`
- Access to the selected image model

## Implementation

```ts
import { writeFile } from 'node:fs/promises'
import { imageGenerationRequest } from '@anvia/core/image-generation'
import { GPT_IMAGE_2, OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY })
const model = client.imageGenerationModel(
  process.env.OPENAI_IMAGE_MODEL ?? GPT_IMAGE_2,
)

const response = await imageGenerationRequest(model)
  .prompt('A clean technical illustration of a document ingestion pipeline')
  .width(1024)
  .height(1024)
  .additionalParams({ output_format: 'png' })
  .send()

await writeFile('pipeline.png', response.image)
console.log({ images: response.images.length, mediaType: response.mediaType })
```

## Run and expected behavior

Run `pnpm tsx image-generation.ts`. A successful request writes `pipeline.png` and prints image
count and MIME type. Generation may take longer than text and can reject prompts under provider
policy.

## Boundaries

Validate and moderate prompts, restrict who may generate assets, and treat returned bytes as
untrusted until media type, dimensions, size, and decode are verified. Establish policies for
copyright, impersonation, minors, sexual content, and provenance. Do not expose provider keys or
arbitrary output paths to browsers.

In production, run generation in a queued worker, use idempotency and request records, scan and store
outputs in protected object storage, apply retention, and handle provider policy rejection separately
from transient failures.

## Source and extensions

Run the
[OpenAI image cookbook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/04_providers_and_multimodal/07-openai-image-generation.ts)
or compare the
[Gemini media example](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/04_providers_and_multimodal/09-gemini-image-and-transcription.ts).
Next, add job status, prompt templates, and an approved asset library.

- [Image generation](/sdk/models/image-generation)
- [Multimodal image guide](/sdk/advanced/multimodal/image)
