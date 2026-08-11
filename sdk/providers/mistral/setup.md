# Setup

Install the Mistral adapter beside Anvia core:

```sh
pnpm add @anvia/core @anvia/mistral
```

Set `MISTRAL_API_KEY` in the server environment and create the client in a server-only module:

```ts
import { MistralClient } from '@anvia/mistral'

export const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
})
```

The constructor fails immediately when neither an API key nor an existing SDK client is supplied. Do not expose the key or provider client to browser code; route browser requests through an application endpoint.

## Client options

| Option | Use |
| --- | --- |
| `apiKey` | Authenticate a Mistral SDK client created by the adapter. |
| `serverURL` | Send SDK requests to a configured alternate server URL. |
| `client` | Reuse an already-created Mistral SDK client. |

Use `serverURL` only for an endpoint known to implement the Mistral SDK surface your application needs:

```ts
const mistral = new MistralClient({
  apiKey: process.env.MISTRAL_API_KEY,
  serverURL: process.env.MISTRAL_SERVER_URL,
})
```

An alternate endpoint can accept basic completions while behaving differently for streaming, tools, schemas, embeddings, OCR, or model listing. Smoke test each required capability.

## Bring an existing SDK client

Install the Mistral SDK as a direct dependency when application infrastructure constructs it:

```sh
pnpm add @mistralai/mistralai
```

```ts
import { Mistral } from '@mistralai/mistralai'
import { MistralClient } from '@anvia/mistral'

const sdk = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
})

export const mistral = new MistralClient({ client: sdk })
```

This is useful when transport configuration or dependency injection is owned elsewhere. Keep the rest of the application dependent on Anvia model contracts rather than passing the SDK client through agents and services.

## Export configured models

Create named model dependencies at the application boundary:

```ts
export const supportModel = mistral.completionModel(
  'mistral-large-latest',
)

export const knowledgeEmbeddings = mistral.embeddingModel(
  'mistral-embed',
)
```

Known model IDs provide editor autocomplete while custom string IDs remain valid. Treat a configured ID as deployment configuration and verify it against the target account and endpoint.
