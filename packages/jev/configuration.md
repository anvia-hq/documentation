# Configuration

## Client options

```ts
const jev = new JevClient({
  apiKey: process.env.TYPESAFE_API_KEY,
  baseUrl: 'https://your-typesafe-compatible-endpoint.example',
  headers: { 'X-Application': 'catalog' },
})
```

| Option | Purpose |
| --- | --- |
| `apiKey` | Authenticates the managed SDK client. Falls back to `TYPESAFE_API_KEY`; a blank key is rejected. |
| `baseUrl` | Overrides the SDK base URL. |
| `headers` | Default request headers. |
| `client` | Reuses an initialized `TypeSafeClient`. |

Managed options and `client` injection are mutually exclusive, and combining them throws a `TypeError`.

## Inject the official client

```ts
import { TypeSafeClient } from '@typesafe-ai/sdk'

const sdk = new TypeSafeClient({ apiKey: process.env.TYPESAFE_API_KEY! })
const jev = new JevClient({ client: sdk })
```

Use injection when native TypeSafe APIs and Anvia decisions should share credentials and transport settings. Managed clients disable SDK logging; injected clients retain their logging configuration.

## Retries

The adapter disables SDK retries on every call, for managed and injected clients. Use `decide({ retries })` or `decideBatch({ retries })` so Core's retry policy is the only layer.

## Model selection

```ts
const model = jev.decisionModel({ modelId: JEV_LATEST })
```

`modelId` is required and must be a non-empty string. `JEV_LATEST` is `'jev-latest'`; other IDs remain valid.

## Provider options

`providerOptions` on a decision request forwards extra JSON body fields. The adapter preserves `model`, `state`, and `questions`, so they cannot be replaced.

## Runtime

The package is ESM, ships declarations, and depends on `@typesafe-ai/sdk`, which requires Node.js 20 or newer. Keep it server-side. Install a version of `@anvia/core` allowed by its peer range.
