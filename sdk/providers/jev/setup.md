# Setup

Install the adapter beside Anvia core. The official SDK it uses requires Node.js 20 or newer.

```sh
pnpm add @anvia/core @anvia/jev
```

Set `TYPESAFE_API_KEY` in the server environment and create the client in a server-only module:

```ts
import { JevClient, JEV_LATEST } from '@anvia/jev'

export const jev = new JevClient({
  apiKey: process.env.TYPESAFE_API_KEY,
})

export const decisionModel = jev.decisionModel({ modelId: JEV_LATEST })
```

`apiKey` falls back to `TYPESAFE_API_KEY` when omitted. The constructor throws a `TypeError` when no key is available or the key is blank. Keep keys and clients out of browser bundles.

## Client options

`JevClient` accepts either managed options or an injected client:

- `apiKey` authenticates the SDK client the adapter creates.
- `baseUrl` points it at a different TypeSafe-compatible endpoint.
- `headers` adds default request headers.
- `client` reuses an existing `TypeSafeClient`.

```ts
const jev = new JevClient({
  apiKey: process.env.TYPESAFE_API_KEY,
  baseUrl: process.env.TYPESAFE_BASE_URL,
  headers: { 'X-Application': 'catalog' },
})
```

Keep endpoint and header values in trusted deployment configuration.

## Bring an existing SDK client

```ts
import { TypeSafeClient } from '@typesafe-ai/sdk'

const sdk = new TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY! })
const jev = new JevClient({ client: sdk })
```

Injection is mutually exclusive with `apiKey`, `baseUrl`, and `headers`; combining them throws. Managed clients disable SDK logging, while injected clients keep their own logging configuration. In both cases the adapter disables SDK retries per call, so `decide({ retries })` controls retry behavior.

## Select a model

`modelId` is required. `JEV_LATEST` (`'jev-latest'`) provides autocomplete, and any other non-empty string is accepted. A blank ID throws a `TypeError`. Treat the ID as deployment configuration and test it against your account.

Continue with [Decisions](/sdk/providers/jev/decisions).
