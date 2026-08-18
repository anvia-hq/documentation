# Create a completion

Use `generateCompletion()` when one model response is the complete operation. Its single options object accepts exactly one of `prompt` or `messages`.

## Before you start

Complete [Install and setup](/sdk/install-and-setup) and create a [completion model](/sdk/models/completion). Keep provider credentials in server-side configuration.

## 1. Send string input

A `prompt` string becomes one user message:

```ts
import { generateCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}

const client = new OpenAIClient({ apiKey })
const model = client.completionModel({
    modelId: 'gpt-5.6-luna',
    api: "responses"
})

const result = await generateCompletion({
    prompt: 'Summarize Anvia in one sentence.',
    model,
    instructions: 'Answer clearly for a TypeScript developer.',
    maxTokens: 120
})

console.log(result.text)
```

`instructions` defines behavior for this request. `prompt` remains the user content the model should answer.

## 2. Send one normalized message

Wrap a structural message in the `messages` array when the input needs metadata or multimodal content:

```ts
import { generateCompletion, type UserMessage } from '@anvia/core'

const input: UserMessage = {
  role: 'user',
  content: 'Classify this request: I need help changing my billing email.',
  metadata: { requestId: 'req_123' },
}

const result = await generateCompletion({
  messages: [input],
  model,
})
```

The message is validated before the provider call. See [Messages](/sdk/messages) for image, document, assistant, and tool-result content.

## 3. Continue a transcript

Pass a non-empty `Message[]` when the application already owns the conversation history:

```ts
import { generateCompletion, type Message } from '@anvia/core'

const transcript = [
  { role: 'system', content: 'You are a concise support assistant.' },
  { role: 'user', content: 'How do I rotate an API key?' },
  { role: 'assistant', content: 'Create a new key, update the service, then revoke the old key.' },
  { role: 'user', content: 'Rewrite that as three numbered steps.' },
] satisfies Message[]

const result = await generateCompletion({
    messages: transcript,
    model
})
```

Anvia sends the transcript but does not persist or append it. Your application remains responsible for storing the next assistant message. Use [memory](/sdk/memory) with an agent when the runtime should manage conversation history.

## 4. Add request controls

The options object can include:

- `instructions` for request-specific behavior;
- `documents` for small text documents attached as context;
- `temperature` and `maxTokens` for provider-supported generation controls;
- `tools` and `toolChoice` for compatible tool-calling models;
- `outputSchema` for a provider JSON schema;
- `providerOptions` for provider-specific JSON values; and
- `retries` for opt-in retry behavior.

Attach documents with stable IDs so providers and traces can distinguish them:

```ts
const result = await generateCompletion({
    prompt: 'Which plan includes audit exports?',
    model,
    documents: [
        {
            id: 'plans',
            text: 'Team includes shared projects. Enterprise adds audit exports.',
            additionalProps: { source: 'pricing-policy' },
        },
    ]
})
```

Document support depends on the selected completion model. Anvia validates declared capabilities before the request is sent.

## 5. Opt into retries

Direct completions do not retry unless the `retries` option is present:

```ts
const result = await generateCompletion({
    prompt: 'Draft a short release note.',
    model,
    retries: {
        maxAttempts: 3,
        initialDelayMs: 200,
        maxDelayMs: 2000,
    }
})
```

The default retry policy covers common connection failures, rate limits, request timeouts, conflicts, and server errors. Authentication errors, invalid input, and aborted requests are not retried by default. Supply `shouldRetry` only when the application needs a narrower policy.

## Handle failures at the boundary

The promise rejects for invalid input, unsupported capabilities, provider validation, authentication, transport failure, or an exhausted retry policy. Log diagnostic details on the server, but map them to safe application errors before returning a response to users.

Continue with [Completion result](/sdk/completions/result).
