# Install and setup

Install Anvia's core runtime and the provider package your application needs. This guide uses OpenAI, but the runtime stays provider-neutral.

## Before you start

You need an ESM TypeScript project, pnpm, and an API key for your chosen model provider.

## Install the packages

Start with the smallest useful stack: the core runtime and one provider.

```bash
pnpm add @anvia/core @anvia/openai
```

Add other packages only when the application needs them.

| Package | Use it for |
| --- | --- |
| `@anvia/server` | Exposing agent runs and streams over HTTP. |
| `@anvia/react` | Consuming agent state and streams in React. |
| `@anvia/logger` | Structured runtime logging. |
| `@anvia/sandbox` | Running code in an isolated sandbox. |
| `@anvia/studio` | Inspecting agents during development. |
| `zod` | Defining schemas for tools and structured output. |

## Configure your API key

Set the provider key in the server environment. Keep it out of browser code and source control.

```bash
OPENAI_API_KEY=your_api_key
```

## Create a model

Provider clients create models that can be passed to Anvia's runtime primitives.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

export const model = client.completionModel('gpt-5')
```

## Verify the setup

Run one direct completion before adding an agent. This confirms that the package, credential, and provider model are wired correctly.

```ts
import { createCompletion } from '@anvia/core'
import { model } from './model'

const result = await createCompletion(model, {
  input: 'Reply with: Anvia is ready.',
})

console.log(result.text)
```

If the request returns a response, the setup is ready. Continue with [Your first agent](/sdk/your-first-agent).
