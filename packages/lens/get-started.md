# Get started

`@anvia/lens` connects a Node.js application directly to an Anvia Lens project for tracing, evaluations, and managed datasets.

## Install

```bash
pnpm add @anvia/core @anvia/lens
```

Set server-only project credentials:

```bash
ANVIA_LENS_BASE_URL=https://lens.example.com
ANVIA_LENS_PUBLIC_KEY=pk_...
ANVIA_LENS_SECRET_KEY=sk_...
ANVIA_LENS_SERVICE_NAME=support-api
ANVIA_LENS_ENVIRONMENT=production
ANVIA_LENS_RELEASE=2026.08.1
```

```ts
import { Agent } from '@anvia/core'
import { LensClient } from '@anvia/lens'

const lens = new LensClient()
const tracing = lens.observer({ captureMode: 'safe' })

const agent = new Agent({
  id: 'support',
  model: model,
  observability: { observers: { tracing } },
})
```

`LensClient` reads the `ANVIA_LENS_*` environment variables and requires a complete connection. For code that may run without Lens, construct it with `{ optional: true }`; no credentials produces a disabled no-op observer, while partial credentials still fail fast.

Call `lens.flush()` before a short-lived script exits and `lens.close()` during graceful service termination.

## Next

- [Tracing](/packages/lens/tracing)
- [Evals and datasets](/packages/lens/evals-and-datasets)
- [Data and privacy](/packages/lens/data-and-privacy)
- [Lifecycle](/packages/lens/lifecycle)
