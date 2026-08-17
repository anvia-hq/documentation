# Compatibility testing

Run a small live contract suite before a compatible endpoint receives production traffic. Use the exact `baseUrl`, completion adapter, model ID, account, and provider parameters that the deployment will use.

## Start with a smoke script

```ts
import { generateCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.COMPATIBLE_API_KEY
const baseUrl = process.env.COMPATIBLE_BASE_URL
const modelId = process.env.COMPATIBLE_MODEL

if (!apiKey || !baseUrl || !modelId) {
  throw new Error('Compatible provider environment is incomplete')
}

const client = new OpenAIClient({
  apiKey,
  baseUrl,
})

const model = client.completionModel({
    modelId: modelId,
    api: "chat"
})
const result = await generateCompletion({
    prompt: 'Reply with exactly: compatible',
    model,
    temperature: 0,
    maxTokens: 16
})

if (!result.text.toLowerCase().includes('compatible')) {
  throw new Error(`Unexpected compatible response: ${result.text}`)
}
```

Run this with deployment secrets from a trusted environment. It proves credentials, URL construction, model routing, and basic normalization—not the complete product workflow.

## Add a streaming probe

```ts
import { streamCompletion } from '@anvia/core'

let text = ''
let completed = false

for await (const event of streamCompletion({
    prompt: 'Write one short greeting.',
    model,
    maxTokens: 32
})) {
  if (event.type === 'text_delta') text += event.delta
  if (event.type === 'final') completed = true
}

if (!text || !completed) {
  throw new Error('Compatible stream produced no text or final event')
}
```

Consume the stream completely. A server can return initial deltas correctly and still fail on terminal events, tool arguments, usage, or error chunks.

## Build workflow fixtures

Add one fixture for each feature the application depends on:

- a required tool call with complete validated arguments
- a multi-turn tool result replayed to the model
- a schema matching production nesting and optional fields
- a representative image or document with its real media type and size
- realistic embedding input batches when embeddings are enabled
- intentional authentication and invalid-model failures
- timeout and rate-limit behavior at the application boundary

Assert normalized Anvia output and application behavior. A raw HTTP 200 is not enough.

## Record the tested contract

Store the provider or gateway name, endpoint host and route version without credentials, selected adapter, exact model ID, important provider parameters, Anvia package versions, timestamp, and feature results.

Repeat the suite whenever one of those values changes. For moving local aliases, run a lightweight periodic probe because the underlying model can change without an application deployment.

Use fake Anvia model contracts for ordinary unit tests. Reserve live tests for provider integration and deployment validation so the main suite remains fast and deterministic.
