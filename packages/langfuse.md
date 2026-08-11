# `@anvia/langfuse`

`@anvia/langfuse` connects Anvia runs to Langfuse tracing and adds scoring, evaluation reporting, datasets, experiments, prompt retrieval, and configurable PII redaction.

## Install

```bash
pnpm add @anvia/core @anvia/langfuse
```

```ts
import { AgentBuilder } from '@anvia/core'
import { langfuse } from '@anvia/langfuse'

const tracing = langfuse.create({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
  environment: 'production',
  captureMode: 'safe',
})

const agent = new AgentBuilder('support', model)
  .observe(tracing)
  .build()
```

Call `flush()` before a short-lived worker exits and `shutdown()` during service termination so queued traces and scores have time to reach Langfuse.

## Beyond tracing

- Publish Anvia evaluation results with `createLangfuseEvalReporter`.
- Read and update datasets with `createLangfuseDatasetClient`.
- Run an Anvia evaluation suite as a Langfuse experiment with `runEvalAsExperiment`.
- Resolve versioned text or chat prompts with `createLangfusePromptClient`.
- Submit scores through the tracing handle.
- Redact common and application-specific PII before capture.

## Capture and reliability

Safe capture is the appropriate default. Bound captured payloads, choose shallow or deep redaction deliberately, and decide whether score publishing or a missing trace should fail the active evaluation workflow.

## Compatibility

The package peers with `@anvia/core` and includes the Langfuse OpenTelemetry and tracing libraries. Credentials, network policy, application shutdown, and Langfuse project configuration remain caller-owned.

## Next steps

- [Public API](/packages/langfuse/api-reference)
- [Connect existing Langfuse instrumentation](/lens/connect/langfuse)
- [Package changelog](https://github.com/anvia-hq/anvia/blob/main/packages/observability-langfuse/CHANGELOG.md)

