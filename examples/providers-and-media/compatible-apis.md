# Compatible APIs

**Type:** Pattern

## Outcome

Run Anvia against an OpenAI-compatible Chat Completions endpoint through `@anvia/openai`. Use this
when a gateway or hosted model exposes the compatible HTTP surface and has passed your workflow's
contract tests.

## Prerequisites

- `@anvia/core`, `@anvia/openai`, and `tsx`
- `COMPATIBLE_BASE_URL`, `COMPATIBLE_API_KEY`, and an exact `COMPATIBLE_MODEL`
- Provider documentation confirming whether the URL includes `/v1`

## Client boundary

```ts
import { generateCompletion } from '@anvia/core/completion'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.COMPATIBLE_API_KEY
const baseUrl = process.env.COMPATIBLE_BASE_URL
const modelId = process.env.COMPATIBLE_MODEL

if (!apiKey || !baseUrl || !modelId) throw new Error('Set compatible endpoint configuration.')

const client = new OpenAIClient({
  apiKey,
  baseUrl,
})

const result = await generateCompletion({
    prompt: 'Reply with: compatible',
    model: client.completionModel({
        modelId: modelId,
        api: "chat"
    }),
    instructions: 'Reply with exactly the requested word.'
})

if (!result.text.toLowerCase().includes('compatible')) {
  throw new Error(`Unexpected response: ${result.text}`)
}

console.log(result.text)
```

## Run and expected behavior

Save as `compatible.ts` and run `pnpm tsx compatible.ts`. A compatible endpoint should return the
requested text. Supplying `baseUrl` selects Chat by default; the explicit option documents the
assumption. Select `responses` only when the endpoint implements the OpenAI Responses API.

## Boundaries

“OpenAI-compatible” is route-specific, not feature parity. A successful text call does not prove
streaming, tools, schemas, reasoning replay, usage, model listing, embeddings, or media. Never let a
prompt control `baseUrl`, credentials, routing headers, or model IDs. Treat the gateway as a data
processor that can receive the entire prompt.

In production, pin endpoint and model configuration, run live tests for every required capability,
normalize safe errors, control retries, and evaluate latency, output quality, tool accuracy, and
schema validity before shifting traffic.

## Source and extensions

The behavior is grounded in the
[`OpenAIClient` adapter](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/provider-openai/src/openai/client.ts)
and its package tests. Next, add streaming, one tool round trip, and one schema test to the probe.

- [Compatible APIs](/sdk/providers/compatible)
- [Compatibility testing](/sdk/providers/compatible/testing)
