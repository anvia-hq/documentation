# `@anvia/lens`

`@anvia/lens` is the native adapter between an Anvia application and Lens. It sends traces and evaluation results and reads versioned managed datasets with the same project credentials.

## Install

```bash
pnpm add @anvia/core @anvia/lens
```

Set the Lens connection in the server environment:

```bash
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk_...
ANVIA_LENS_SECRET_KEY=sk_...
```

Then attach the observer:

```ts
import { Agent } from '@anvia/core'
import { lens } from '@anvia/lens'

const tracing = lens.createFromEnv({
  serviceName: 'support-api',
  environment: 'production',
  captureMode: 'safe',
})

const agent = new Agent({
  id: 'support',
  model: model,
  observers: [tracing],
})
```

## Evaluations and datasets

Use `lens.evals()` when one lifecycle should own both the trace observer and evaluation reporter. Use `createLensDatasetClient()` to read a named, published dataset version for local or CI evaluation runs.

```ts
const integration = lens.evals({ optional: false })

try {
  // Run evaluation suites with integration.observer and integration.reporter.
} finally {
  await integration.shutdown()
}
```

## Operational patterns

- Keep secret keys in server-only environment variables.
- Begin with safe capture and enable full payloads only after reviewing data policy.
- Add custom redaction patterns for application-specific identifiers.
- Flush short-lived scripts before process exit; shut down long-lived services during graceful termination.
- Pin a dataset version when a CI result must be reproducible.

## Compatibility

`@anvia/lens` requires Node.js 24 or newer and peers with `@anvia/core`. It exports telemetry through HTTP and therefore needs network access to the configured Lens deployment.

## Next steps

- [Get started](/packages/lens/get-started)
- [Tracing](/packages/lens/tracing)
- [Evals and datasets](/packages/lens/evals-and-datasets)
- [Data and privacy](/packages/lens/data-and-privacy)
- [Lifecycle](/packages/lens/lifecycle)
- [Public API](/packages/lens/api-reference)
- [Releases](/packages/lens/releases)
- [Connect Anvia to Lens](/lens/connect/anvia)
- [Lens evaluations](/lens/evaluations)
