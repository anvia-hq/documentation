# `@anvia/langfuse`

`@anvia/langfuse` connects Anvia runs to Langfuse tracing and adds scoring, evaluation reporting, datasets, experiments, prompt retrieval, and configurable PII redaction.

## Install

```bash
pnpm add @anvia/core @anvia/langfuse
```

```ts
import { Agent } from '@anvia/core'
import { LangfuseClient } from '@anvia/langfuse'

const langfuse = new LangfuseClient({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
  environment: 'production',
})
const tracing = langfuse.observer({ captureMode: 'safe' })

const agent = new Agent({
  id: 'support',
  model: model,
  observability: { observers: { tracing } },
})
```

Call `langfuse.flush()` before a short-lived worker exits and `langfuse.close()` during service termination so queued traces and scores have time to reach Langfuse.

## Beyond tracing

- Publish Anvia evaluation results with `langfuse.evalReporter()`.
- Read and update datasets with `langfuse.datasetClient()`.
- Run an Anvia evaluation suite as a Langfuse experiment with `langfuse.runEvalExperiment()`.
- Resolve versioned text or chat prompts with `langfuse.promptClient()`.
- Redact common and application-specific PII before capture.

## Capture and reliability

Safe capture is the appropriate default. Bound captured payloads, choose shallow or deep redaction deliberately, and decide whether score publishing or a missing trace should fail the active evaluation workflow.

## Compatibility

The package peers with `@anvia/core` and includes the Langfuse OpenTelemetry and tracing libraries. Credentials, network policy, application shutdown, and Langfuse project configuration remain caller-owned.

## Next steps

- [Get started](/packages/langfuse/get-started)
- [Tracing](/packages/langfuse/tracing)
- [Prompts and data](/packages/langfuse/prompts-and-data)
- [Evals and scores](/packages/langfuse/evals-and-scores)
- [Data and privacy](/packages/langfuse/data-and-privacy)
- [Lifecycle](/packages/langfuse/lifecycle)
- [Public API](/packages/langfuse/api-reference)
- [Releases](/packages/langfuse/releases)
- [Connect existing Langfuse instrumentation](/lens/connect/langfuse)
