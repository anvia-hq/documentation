# Releases

The reviewed source release is `@anvia/extensions` **0.3.0**, reviewed against SDK source at
`386b66ba` on 2026-11-28. The package is pre-1.0: minor releases may change APIs. The reviewed
version is a source baseline; consult npm for the currently published tag.

## Changes in 0.3.0

Expands every area of the package. See the [API reference](/packages/extensions/api-reference).

- Toolkits: `shell`, `git`, `datetime`, `scratchpad`, and `math`.
- Web-search providers: `serper`, `perplexity`, `firecrawl`, and `jina`.
- Tool wrappers: `withToolTimeout`, `withToolRetry`, `withToolRateLimit`, and `withToolSummary`.
- Guardrails: `patternGuardrail`, `promptInjectionGuardrail`, and `topicGuardrail`.
- Middlewares: `sanitizeToolErrors` and `historyWindow`.
- Hooks: `costHook` (with `calculateUsageCost`) and `jsonlHook`.

## Changes in 0.2.0

First release, alongside core's `Toolkit` primitive and lifecycle arrays in `@anvia/core` 1.25.0.

- Toolkits: `webSearch` (with `tavily`, `exa`, `brave`, and `searxng`), `webFetch`, `filesystem`,
  `httpClient`, and `todo`.
- `withToolCache`.
- Guardrails: `piiGuardrail`, `secretLeakGuardrail`, `lengthGuardrail`, and `llmGuardrail`.
- Middlewares: `toolOutputLimit`, `redactToolOutput`, and `redactCompletionRequest`.
- Hooks: `usageHook`, `auditHook`, and `consoleHook`.

See the [source changelog](https://github.com/anvia-hq/anvia/blob/386b66ba/packages/extensions/CHANGELOG.md)
for individual release entries.

| Version | Summary |
| --- | --- |
| `0.3.0` | Added shell, git, datetime, scratchpad, and math toolkits; four more search providers; timeout, retry, rate-limit, and summary wrappers; pattern, prompt-injection, and topic guardrails; `sanitizeToolErrors` and `historyWindow`; `costHook` and `jsonlHook`. |
| `0.2.0` | First release: web search, web fetch, filesystem, HTTP, and todo toolkits; `withToolCache`; PII, secret, length, and LLM guardrails; output-limit and redaction middlewares; usage, audit, and console hooks. |
