# `@anvia/lens` API reference

```ts
import {
  LensClient,
  LensDatasetError,
  LensPromptError,
  LensPromptCompilationError,
  resolveLensConfig,
  createLensRedactor,
  DEFAULT_PATTERNS,
} from '@anvia/lens'
```

## `LensClient`

```ts
const lens = new LensClient(options)
const observer = lens.observer(observerOptions)
const pipelineObserver = lens.pipelineObserver(observerOptions)
const reporter = lens.evalReporter<Input, Output, Expected>(reporterOptions)
const datasets = lens.datasetClient(datasetOptions)
const prompts = lens.promptClient(promptOptions)
await lens.score(scoreArgs)

await lens.flush()
await lens.close()
```

Client options include `baseUrl`, `publicKey`, `secretKey`, `serviceName`, `environment`, `release`,
`timeoutMs`, `captureMode`, `captureMaxBytes`, `redactInputs`, `redactOutputs`, `redactErrors`,
`redactMetadata`, custom `redaction`, and `optional`. `baseUrl` is validated eagerly as an absolute
HTTP(S) URL without a query or fragment. The readonly `enabled` flag is false only when optional
mode has no configured connection.

`observer()` returns an `AgentObserver`. `pipelineObserver()` returns a `PipelineObserver` and shares
the client's lazy provider and capture defaults. Both accessors return disabled no-op observers in
optional mode and reject new work after the client closes. `LensClient` also supports `Symbol.asyncDispose`, which delegates to `close()`.

`evalReporter()` returns an Anvia `EvalReporter`. It inherits the client's capture and redaction
policy and accepts those settings as per-reporter overrides alongside `traceObserver`,
`publishInvalid`, `includeMetadata`, `includePayloads`, and `onMissingTrace`.

`score()` accepts `LensScoreArgs`, validates the score, and queues a trace-correlated evaluation log
through the client-owned logs provider. A disabled optional client treats it as a no-op. See
[Runtime scoring](/packages/lens/runtime-scoring).

## Managed datasets

```ts
const dataset = await lens.datasetClient({ pageSize: 50 }).getDataset<Input, Expected>({
  name: 'support-cases',
  version: 'v2',
})
```

The returned `LensDataset` contains `name`, `version`, optional description and metadata, and normalized items. `LensDatasetError` exposes `status` and a stable `code`. Page size defaults to 50 and accepts 1–100; retrieval is capped at 100 pages and throws `pagination_limit` beyond that limit rather than returning partial data. Changing dataset identity/version or page counts during retrieval yields `invalid_response`.

## Versioned prompts

This complete helper reads and compiles a text template from an application-owned client:

```ts anvia-check lens-prompt-example
import type { LensClient } from '@anvia/lens'

export async function compileSupportPrompt(lens: LensClient, question: string) {
  const prompts = lens.promptClient({ cacheTtlMs: 60_000, timeoutMs: 5_000 })
  const prompt = await prompts.getPrompt({ name: 'support/answer', label: 'production' })
  if (prompt.type !== 'text') throw new TypeError('Expected a text prompt')
  return { text: prompt.compile({ question }), ref: prompt.ref }
}
```

`getPrompt()` accepts `name`, either a positive integer `version` or a `label`, `cache`, and an optional `signal`. Omitted selectors resolve `production`, not the newest version. `LensPrompt` is a text/chat snapshot with `ref`, `config`, `labels`, `selector`, and `variables`; compilation is synchronous. Missing/non-string variables throw `LensPromptCompilationError`. HTTP and retrieval failures use `LensPromptError` with a stable `code` and optional `status`.

Each client owns a bounded cache with a 60-second default TTL. `reload` replaces a cached snapshot; `no-store` bypasses reads/writes; `clearCache()` invalidates it. Closing Lens aborts pending prompt retrieval and rejects new operations. Prompt/dataset accessors throw in disabled optional mode; they are not no-op readers.

Public types include `LensPromptClient`, `LensPromptClientOptions`, `LensPromptGetOptions`, `LensPromptRef`, `LensPromptJson`, `LensTextPrompt`, `LensChatPrompt`, and `LensChatMessage`. See [Versioned prompts](/lens/connect/anvia/versioned-prompts) for compilation, caching, and explicit attribution.

## Redaction

`createLensRedactor(options)` returns the package redactor. Supplying custom `patterns` replaces `DEFAULT_PATTERNS`; include the defaults explicitly when both sets are required. The public `passesLuhn` checksum helper is documented with its [Core utility boundary](/packages/core/api-reference#integration-utility-reference); it is not proof that a card or payment is valid.

## Public types

The package exports client, Agent and Pipeline observer, capture, redaction, evaluation-reporter,
runtime-scoring, prompt, and dataset option/result types named with the `Lens*` prefix, including
`LensObserverOptions`, `LensPipelineObserverOptions`, and `LensScoreArgs`.
