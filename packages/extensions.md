# `@anvia/extensions`

`@anvia/extensions` collects ready-made building blocks for Anvia agents: toolkits for files, shell
commands, git, HTTP, web search and fetch, task lists, notes, dates, and math; tool wrappers for
caching, timeouts, retries, rate limits, and summaries; guardrail policies; agent middlewares; and
lifecycle hooks for usage, cost, and audit records. Every export plugs into an existing `Agent`
option, so you can adopt one piece without the rest.

::: warning Pre-1.0
`@anvia/extensions` is **0.x**. Minor releases may change option names, defaults, and tool schemas,
and the package is outside the [stable v1 boundary](/packages/compatibility-and-versioning). Pin the
version and read the [release notes](/packages/extensions/releases) before upgrading.
:::

## Install

```sh
pnpm add @anvia/core @anvia/extensions zod
```

The reviewed release is **0.3.0**. It declares peer dependencies on `@anvia/core` `^1.25.1` and
`zod` `^4.6.7`, has no other runtime dependencies, is ESM-only, and requires **Node.js 20.3 or
newer**. Toolkits are built on core's [`createToolkit`](/sdk/tools/toolkits), so the toolkit options
`include`, `exclude`, `prefix`, `requiresApproval`, `timeoutMs`, and `instructions` work the same way
here.

## Where each export plugs in

| Subpath | Exports | Agent option |
| --- | --- | --- |
| `@anvia/extensions/tools/fs` | `filesystem()` | `tools` |
| `@anvia/extensions/tools/shell` | `shell()` | `tools` |
| `@anvia/extensions/tools/git` | `git()` | `tools` |
| `@anvia/extensions/tools/http` | `httpClient()` | `tools` |
| `@anvia/extensions/tools/web-fetch` | `webFetch()` | `tools` |
| `@anvia/extensions/tools/web-search` | `webSearch()` and eight search providers | `tools` |
| `@anvia/extensions/tools/todo` | `todo()` | `tools` |
| `@anvia/extensions/tools/scratchpad` | `scratchpad()` | `tools` |
| `@anvia/extensions/tools/datetime` | `datetime()` | `tools` |
| `@anvia/extensions/tools/math` | `math()` | `tools` |
| `@anvia/extensions/tools` | All toolkits above, plus `withToolCache`, `withToolTimeout`, `withToolRetry`, `withToolRateLimit`, `withToolSummary` | `tools` |
| `@anvia/extensions/guardrails` | `piiGuardrail`, `secretLeakGuardrail`, `patternGuardrail`, `promptInjectionGuardrail`, `topicGuardrail`, `lengthGuardrail`, `llmGuardrail` | `guardrails` |
| `@anvia/extensions/middlewares` | `toolOutputLimit`, `redactToolOutput`, `redactCompletionRequest`, `sanitizeToolErrors`, `historyWindow` | `middlewares` |
| `@anvia/extensions/hooks` | `usageHook`, `costHook`, `auditHook`, `jsonlHook`, `consoleHook` | `lifecycle` |
| `@anvia/extensions` | Everything above | — |

Import from the narrowest subpath. The root and the `./tools` barrel load every module, including the
Node-only ones.

## Runtime support

Several modules import Node built-ins at load time, so they do not run on edge or browser runtimes:

| Node-only | Why |
| --- | --- |
| `tools/fs`, `tools/shell`, `tools/git` | File system and child processes |
| `tools/http`, `tools/web-fetch`, `tools/web-search` | DNS checks and pinned Node HTTP requests for URL safety |
| `hooks` (through `jsonlHook`) | Appends to a local file |
| `@anvia/extensions`, `@anvia/extensions/tools` | Re-export the modules above |

`tools/todo`, `tools/scratchpad`, `tools/datetime`, `tools/math`, `guardrails`, and `middlewares`
import only `@anvia/core` and `zod`. Some wrappers and providers call `.unref()` on timers, which is a
Node API; verify the exact module on any non-Node runtime before relying on it.

## Next steps

- [Get started](/packages/extensions/get-started): one agent using a toolkit, a guardrail, a middleware, and a hook.
- [Toolkits](/packages/extensions/toolkits): tool names, defaults, approvals, providers, and wrappers.
- [Guardrails, middlewares, and hooks](/packages/extensions/guardrails-middlewares-hooks): defaults and behavior.
- [Security](/packages/extensions/security): what the package enforces and what your application still owns.
- [API reference](/packages/extensions/api-reference) and [Releases](/packages/extensions/releases).

For the concepts underneath, see [Toolkits](/sdk/tools/toolkits), [Guardrails](/sdk/guardrails),
[Tool middleware](/sdk/tools/middleware), and [Lifecycle hooks](/sdk/advanced/hooks).
