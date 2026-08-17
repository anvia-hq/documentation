# Configuration

`GeminiClientOptions` prevents mixing Gemini API-key and Vertex settings.

## Gemini Developer API

```ts
const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY!,
})
```

`apiKey` is required unless `client` is supplied. Do not set `project` or `location` in this mode.

## Vertex AI

```ts
const gemini = new GeminiClient({
  vertexAi: {
    projectId: 'my-gcp-project',
    location: 'us-central1',
    googleAuthOptions: {
      credentials: trustedServiceAccount,
    },
  },
})
```

Although `project` and `location` are optional in the TypeScript option shape, the Anvia constructor requires non-empty values when it creates the Google client. They may be omitted only when an initialized `client` is supplied.

## Inject a Google client

```ts
import { GoogleGenAI } from '@google/genai'

const native = new GoogleGenAI({ apiKey })
const gemini = new GeminiClient({ client: native })
```

Injection is useful when application code also calls native files, caches, or live APIs.

## Embedding configuration

```ts
const model = gemini.embeddingModel({
    modelId: 'gemini-embedding-001',
    dimensions: 768,
    maxBatchSize: 50,
    taskType: 'RETRIEVAL_DOCUMENT',
    title: 'Product documentation'
})
```

Changing dimensions or semantic task changes index compatibility. Store those settings alongside collection metadata.

## Additional parameters

Completion, images, and transcription accept provider-specific additional parameters through their Anvia request types. Image requests merge a nested `config` object with the adapter’s response modality and aspect-ratio defaults. Test overrides carefully because the provider can accept combinations that no longer yield an image.

## Runtime

The package is ESM, uses Node binary utilities for media conversion, includes declarations, and should be installed with the matching `@anvia/core` release candidate. Validate media and streaming behavior before targeting a non-Node runtime.
