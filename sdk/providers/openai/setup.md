# Setup

Install the provider adapter beside Anvia core:

```sh
pnpm add @anvia/core @anvia/openai
```

Set `OPENAI_API_KEY` in the server environment, then construct the client in server-only code:

```ts
import { OpenAIClient } from '@anvia/openai'

export const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})
```

Do not place the client or API key in a browser bundle. Browser applications should call an application route that owns the model request.

## Client options

`OpenAIClient` accepts the following verified configuration:

| Option | Use |
| --- | --- |
| `apiKey` | Authenticate a client created by the adapter. |
| `baseUrl` | Target an OpenAI-compatible endpoint. |
| `headers` | Add headers required by the configured endpoint. |
| `completionApi` | Select `"responses"` or `"chat"`. |
| `client` | Reuse an already-created OpenAI SDK client. |

The constructor requires either `apiKey` or `client`. Keep a preconfigured client useful when transport, organization-wide SDK configuration, or application dependency injection belongs elsewhere.

```ts
import OpenAI from 'openai'
import { OpenAIClient } from '@anvia/openai'

const sdk = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const openai = new OpenAIClient({ client: sdk })
```

## Custom endpoints

Setting `baseUrl` makes the Chat adapter the default. Compatible endpoints often share request shapes without supporting the same tools, schemas, reasoning fields, streaming chunks, or media behavior.

```ts
const compatible = new OpenAIClient({
  apiKey: process.env.COMPATIBLE_API_KEY,
  baseUrl: 'https://provider.example.com/v1',
  completionApi: 'chat',
})
```

Use the dedicated [Compatible APIs guide](/sdk/providers/compatible) and smoke test every required workflow. The current documented `@anvia/openai` public surface does not provide a dedicated Azure OpenAI client, so this guide does not prescribe unverified Azure configuration.

## Export models, not credentials

A small model module keeps provider details out of agents and business logic:

```ts
export const supportModel = openai.completionModel('gpt-5')
export const knowledgeEmbeddings = openai.embeddingModel(
  'text-embedding-3-small',
)
```

Model-name types provide autocomplete for known IDs while still allowing custom strings. Validate a configured model ID at startup or with a deployment smoke test rather than assuming autocomplete proves availability.
