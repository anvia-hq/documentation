# Setup

Install the Gemini adapter next to the core runtime:

```bash
pnpm add @anvia/core @anvia/gemini
```

## Configure the Gemini API

Set the API key in the server environment:

```sh
GEMINI_API_KEY="your-api-key"
```

Create the client in a server-only module:

```ts
import { GeminiClient } from '@anvia/gemini'

export const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY,
})

export const completionModel = gemini.completionModel(
  'gemini-2.5-flash',
)
```

Construction fails when the API key is missing or empty. Validate environment configuration at startup so the deployment fails before it accepts traffic.

## Use the model with an agent

```ts
import { Agent } from '@anvia/core'
import { completionModel } from './gemini'

export const supportAgent = new Agent({
  id: 'support',
  model: completionModel,
  instructions: 'Answer support questions clearly. Use tools for account data.',
  maxTurns: 4,
})
```

The agent remains provider-neutral. Provider selection stays in the model module, making it easier to test the workflow with a fake model or replace the deployment later.

## Inject an existing Google client

Pass an existing `GoogleGenAI` instance when the application needs to own its construction:

```ts
import { GoogleGenAI } from '@google/genai'
import { GeminiClient } from '@anvia/gemini'

const google = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export const gemini = new GeminiClient({ client: google })
```

Install `@google/genai` directly when application code imports it. Authentication and SDK lifecycle are then the application's responsibility.

## Keep credentials out of the browser

Browser code should call an application route that owns the agent or completion request. Never expose a Gemini key through public environment variables, serialized page data, or browser-side SDK construction.

Continue to [Vertex AI](/sdk/providers/gemini/vertex-ai) when the deployment uses Google Cloud IAM instead of an API key.
