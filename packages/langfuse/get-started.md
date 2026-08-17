# Get started

Use `@anvia/langfuse` when Anvia traces, evaluation scores, datasets, experiments, and managed prompts should integrate with a Langfuse project.

```bash
pnpm add @anvia/core @anvia/langfuse
```

```bash
LANGFUSE_PUBLIC_KEY=pk_...
LANGFUSE_SECRET_KEY=sk_...
LANGFUSE_BASE_URL=https://cloud.langfuse.com
LANGFUSE_TRACING_ENVIRONMENT=production
LANGFUSE_SERVICE_NAME=support-api
```

```ts
import { Agent } from '@anvia/core'
import { LangfuseClient } from '@anvia/langfuse'

const langfuse = new LangfuseClient({
  release: process.env.APP_RELEASE,
})
const tracing = langfuse.observer({ captureMode: 'safe' })

const agent = new Agent({
  id: 'support',
  model: model,
  observability: { observers: { tracing } },
})
```

Explicit options override environment variables. The base URL defaults to Langfuse Cloud and request timeout defaults to 30 seconds.

Call `langfuse.flush()` in short-lived work and `langfuse.close()` when the integration will no longer be used.

## Next

- [Tracing](/packages/langfuse/tracing)
- [Prompts and data](/packages/langfuse/prompts-and-data)
- [Evals and scores](/packages/langfuse/evals-and-scores)
- [Data and privacy](/packages/langfuse/data-and-privacy)
- [Lifecycle](/packages/langfuse/lifecycle)
