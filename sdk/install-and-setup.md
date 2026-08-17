# Install and setup

This guide installs the v1 release candidate, creates a provider model, and verifies one direct completion before an agent is introduced.

## Before you start

You need:

- an ESM-compatible TypeScript project;
- `pnpm` or another Node.js package manager;
- an API key for the provider you plan to use; and
- server-side code where the provider credential can remain private.

## 1. Install core and one provider

Start with the provider-neutral runtime and a single provider adapter. During the release-candidate period, keep every Anvia package on the `rc` tag.

```bash
pnpm add @anvia/core@rc @anvia/openai@rc
```

Other provider adapters use the same runtime boundary:

```bash
pnpm add @anvia/anthropic@rc
pnpm add @anvia/gemini@rc
pnpm add @anvia/mistral@rc
```

Add packages such as `@anvia/server`, `@anvia/react`, memory adapters, or observability integrations only when the application needs those capabilities.

## 2. Configure the credential

Keep provider credentials in the server environment and out of browser code, committed files, and client-visible errors.

```bash
export OPENAI_API_KEY=...
```

Validate required values when the application starts:

```ts
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY is required')
}
```

Failing during startup is easier to diagnose than discovering a missing credential during a user request.

## 3. Create the provider model

The provider client owns provider-specific configuration. `completionModel()` returns the model object consumed by the core runtime.

```ts
import { OpenAIClient } from '@anvia/openai'

const client = new OpenAIClient({ apiKey })

export const model = client.completionModel({
    modelId: 'gpt-5.5',
    api: "responses"
})
```

The client does not read `OPENAI_API_KEY` automatically. Passing the value explicitly keeps configuration inside your application's existing dependency and secret-management layer.

## 4. Verify a direct completion

Test one model call before adding an agent. This isolates installation, credentials, endpoint access, and model selection from agent behavior.

```ts
import { generateCompletion } from '@anvia/core'
import { model } from './model'

const result = await generateCompletion({
    prompt: 'Reply with exactly: Anvia is ready.',
    model,
    instructions: 'Follow the requested output exactly.'
})

console.log(result.text)
console.log(result.usage)
```

The v1 completion API receives the input first and runtime options second. A successful result contains visible `text`, normalized `content`, token `usage`, and the normalized provider `response`.

## 5. Keep packages aligned

Do not mix stable v0 packages with v1 release-candidate packages. When adding another Anvia package, install its `rc` release as well:

```bash
pnpm add @anvia/server@rc @anvia/react@rc
```

Package alignment matters because the provider, core runtime, server transport, and UI packages share TypeScript contracts.

## Troubleshooting the first call

If verification fails, check the boundary in this order:

1. Confirm the API key exists in the server process.
2. Confirm the selected model is available to the provider account.
3. Confirm a custom base URL implements the expected OpenAI-compatible API.
4. Confirm all `@anvia/*` packages use the same release channel.
5. Log the error type and status without logging credentials or sensitive prompts.

Once the direct completion works, continue to [Your first agent](/sdk/your-first-agent).
