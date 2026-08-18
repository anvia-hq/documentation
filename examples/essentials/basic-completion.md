# Text completion

This recipe sends one text request through an Anvia completion model and prints the normalized answer. Use a direct completion when one model response is the whole operation.

## 1. Install the packages

```sh
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/openai
pnpm add --save-dev tsx typescript @types/node
```

Set the provider key in the server environment:

```sh
export OPENAI_API_KEY=your_api_key
```

## 2. Create the completion

Save this as `basic-completion.ts`:

```ts
import { generateCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Set OPENAI_API_KEY before running this example.')
}

const openai = new OpenAIClient({ apiKey })
const model = openai.completionModel({
    modelId: 'gpt-5.6-luna',
    api: "responses"
})

const result = await generateCompletion({
    prompt: 'What is the difference between a library and a framework?',
    model,
    instructions: 'Answer clearly in no more than two sentences.'
})

console.log(result.text)
console.log(result.usage)
```

The input is the first argument. The model and request controls belong in the second argument.

## 3. Run it

```sh
pnpm tsx basic-completion.ts
```

The wording can vary, but the response should be short. Missing credentials, an unavailable model, invalid input, or a provider failure rejects the promise.

## What Anvia normalizes

`OpenAIClient` creates a provider-backed model that implements Anvia's completion contract. `generateCompletion(...)` performs one request; it does not start an agent loop, execute tools, or save history.

The result contains visible `text`, normalized assistant `content`, token `usage`, and the normalized provider `response`. Keep credentials server-side, treat generated text as untrusted, and map provider errors to application-safe responses.

Continue with [streaming completion](./streaming-completion) or [build an agent](./first-agent).
