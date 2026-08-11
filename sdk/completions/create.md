# Create a completion

Call a completion model directly when the application owns everything before and after the model request.

## Before you start

Complete [Install and setup](/sdk/install-and-setup) and create a [completion model](/sdk/models/completion).

## Send a request

```ts
import { createCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const model = openai.completionModel('gpt-5')

const result = await createCompletion(model, {
  instructions: 'Answer clearly and concisely.',
  input: 'Summarize Anvia in one sentence.',
  maxTokens: 120,
})

console.log(result.text)
```

## Configure the request

| Option | Purpose |
| --- | --- |
| `input` | A string, one message, or several messages appended to the transcript. |
| `messages` | Existing provider-neutral message history. |
| `instructions` | Stable behavior for this request. |
| `documents` | Small text documents that should accompany the request. |
| `temperature` | Provider-supported output randomness. |
| `maxTokens` | Maximum generated tokens. |
| `params` | Provider-specific options. |

At least one of `input` or `messages` is required.

## Continue an existing transcript

```ts
const result = await createCompletion(model, {
  messages: previousMessages,
  input: 'Rewrite the last answer as three bullets.',
})
```

This sends the supplied transcript but does not persist it. Your application owns the history; use [memory](/sdk/memory) and an agent session when Anvia should load and append messages automatically.

## Handle failures

The call rejects for empty input, unsupported model features, authentication failures, transport errors, or provider validation errors. Map those errors at the application boundary instead of returning raw provider details to users.
