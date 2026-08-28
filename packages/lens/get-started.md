# Get started

`@anvia/lens` connects a Node.js application directly to an Anvia Lens project for tracing,
evaluations, runtime scoring, and managed datasets.

## Install

```bash
pnpm add @anvia/core @anvia/lens zod
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
const pipelineTracing = lens.pipelineObserver({ captureMode: 'safe' })

const agent = new Agent({
  id: 'support',
  model: model,
  observability: {
    observers: { lens: tracing },
    primaryTrace: 'lens',
  },
})
```

Configure `pipelineTracing` on Pipelines. When a Pipeline and its Agents use the same named
`primaryTrace`, Lens receives one connected trace rather than separate Pipeline and Agent traces.

`LensClient` reads the `ANVIA_LENS_*` environment variables and requires a complete connection. For code that may run without Lens, construct it with `{ optional: true }`; no credentials produces a disabled no-op observer, while partial credentials still fail fast.

Call `lens.flush()` before a short-lived script exits and `lens.close()` during graceful service termination.

## Next

- [Tracing](/packages/lens/tracing)
- [Evals and datasets](/packages/lens/evals-and-datasets)
- [Runtime scoring](/packages/lens/runtime-scoring)
- [Data and privacy](/packages/lens/data-and-privacy)
- [Lifecycle](/packages/lens/lifecycle)
