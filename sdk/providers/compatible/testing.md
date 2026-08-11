# Compatibility testing

A compatible endpoint should pass a small live contract suite before it receives production traffic. Run the suite against the exact `baseUrl`, completion adapter, model ID, account, and provider parameters used by the deployment.

## Start with a smoke script

```ts
import { createCompletion } from '@anvia/core'
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
  completionApi: 'chat',
})

const result = await createCompletion(client.completionModel(modelId), {
  input: 'Reply with exactly: compatible',
  temperature: 0,
  maxTokens: 16,
})

if (!result.text.toLowerCase().includes('compatible')) {
  throw new Error(`Unexpected compatible response: ${result.text}`)
}
```

Gate this script behind deployment secrets and run it from a trusted environment. It proves credentials, URL construction, model routing, and basic normalization—not the rest of the product workflow.

## Add a streaming probe

```ts
import { createCompletionStream } from '@anvia/core'

let text = ''
let completed = false

for await (const event of createCompletionStream(model, {
  input: 'Write one short greeting.',
  maxTokens: 32,
})) {
  if (event.type === 'text_delta') text += event.delta
  if (event.type === 'final') completed = true
}

if (!text || !completed) {
  throw new Error('Compatible stream did not produce text and a final event')
}
```

Consume the stream completely. A server can return initial deltas correctly and still fail on finish events, tool arguments, usage, or error chunks.

## Build a workflow matrix

Keep one fixture for each feature the application depends on:

- a required tool call whose handler validates complete arguments;
- a multi-turn tool result sent back to the model;
- a schema with the nesting and optional fields used in production;
- a representative image or document, including real media type and size;
- a batch of realistic embedding inputs if embeddings are enabled;
- an intentional authentication or invalid-model failure;
- timeout and rate-limit behavior at the application boundary.

Assert normalized Anvia output and application behavior. A raw HTTP 200 is not enough.

## Record the tested contract

Store these values with the result:

- provider and gateway name;
- endpoint host and route version, without credentials;
- `"chat"` or `"responses"`;
- exact model ID;
- important provider parameters;
- Anvia package versions;
- test timestamp and feature results.

Repeat the suite when any value changes. For endpoints backed by moving local aliases, schedule a lightweight periodic probe because the model can change without an application deployment.

Use fake Anvia model contracts for ordinary unit tests. Reserve these live tests for provider integration and deployment validation so most of the test suite stays fast and deterministic.

