# Guardrails, middlewares, and hooks

These exports produce the same objects you would write by hand: guardrail policies for
`Agent({ guardrails })`, middlewares for `Agent({ middlewares })`, and lifecycle objects for
`Agent({ lifecycle })`. They follow the core semantics in [Guardrails](/sdk/guardrails),
[Tool middleware](/sdk/tools/middleware), and [Lifecycle hooks](/sdk/advanced/hooks).

## Guardrails

Import from `@anvia/extensions/guardrails`. Each factory returns a `GuardrailPolicy`. Common options:

- `boundary`: `'input'`, `'output'`, or `'both'`.
- `mode`: `'enforce'` (default) or `'observe'`, which records decisions without applying them.
- `id`, `reason`, and `message` (the user-facing text returned when content is blocked).

| Factory | Default boundary | Default action | Notes |
| --- | --- | --- | --- |
| `piiGuardrail()` | `both` | `redact` with `[redacted-pii]` | Patterns `email`, `creditCard`, `phone`, `ipv4`. The `ipv4` pattern matches any dotted quad, including version strings such as `1.2.3.4`. |
| `secretLeakGuardrail()` | `output` | `block` | Ten credential patterns, including Google, GitHub, AWS, and Slack keys, PEM private keys, JWTs, generic `sk-`/`api_` keys, and bearer tokens. `redact` uses `[redacted-secret]`. |
| `patternGuardrail({ patterns })` | `both` | `block` | Your own non-empty `RedactionPattern` list; `redact` uses `[redacted]`. |
| `promptInjectionGuardrail()` | `input` | `block` | Four heuristic patterns (ignore-instructions, reveal-system-prompt, role override, fake role delimiters). Add `extraPatterns`, replace them with `patterns`, or pass `model` for a second-stage model check when no pattern matches. |
| `topicGuardrail({ allowedTopics, blockedTopics })` | `input` | `block` | Needs at least one list. String topics match as case-insensitive whole words; `RegExp` values are used as given. Blocked topics are checked first; with `allowedTopics`, content must match one. With `model`, a model classifies the topics instead. |
| `lengthGuardrail({ maxChars })` | `input` | `block` | `action: 'truncate'` shortens instead. Set `boundary: 'output'` or `'both'` to limit answers too. |
| `llmGuardrail({ model, policy })` | `input` | `block` | A model judges content against your plain-language `policy` and returns `{ allowed, reason }`. |

The model-backed checks (`llmGuardrail`, and `promptInjectionGuardrail` or `topicGuardrail` with
`model`) send content to that model as JSON-encoded, escaped data. They default to `maxTokens: 256`
and `temperature: 0` when the model accepts a temperature. A failed or unparseable judge call throws;
in `enforce` mode a thrown check fails the run, and in `observe` mode it is recorded as an error
decision.

`DEFAULT_PII_PATTERNS`, `DEFAULT_SECRET_PATTERNS`, `DEFAULT_PROMPT_INJECTION_PATTERNS`,
`PII_PATTERN_NAMES`, and `SECRET_PATTERN_NAMES` are exported so you can extend the built-in sets.

## Middlewares

Import from `@anvia/extensions/middlewares`. Each factory returns an `AgentMiddleware`.

| Factory | Hook | Behavior |
| --- | --- | --- |
| `toolOutputLimit({ maxChars })` | tool output | Truncates tool results, including structured text parts, over `maxChars` and appends `suffix` (default `"\n...[truncated]"`). Limit to some tools with `tools`. |
| `redactToolOutput()` | tool output | Redacts tool results before the model sees them. The default pattern set is core's full `DEFAULT_PATTERNS`, which covers **personal data as well as secrets**, replaced with `<redacted>`. Pass `patterns` and `replacement`, or your own `redactor`, but not both. |
| `redactCompletionRequest()` | completion request | Redacts instructions, documents, and system, user, assistant, and tool messages in every outgoing model request. Same pattern options. |
| `sanitizeToolErrors()` | completion request | Cleans tool **error** results in outgoing history: strips stack-trace lines, replaces absolute paths with `[path]`, and caps each message at 1,000 characters (`fallbackMessage` replaces an emptied error). |
| `historyWindow({ maxMessages, maxChars })` | completion request | Drops older history turns. Requires **at least one** of `maxMessages` or `maxChars`; otherwise it throws. Keeps leading system messages (`preserveSystemMessages: true`), never splits a tool call from its result, and always keeps the most recent turn even if it exceeds the budget. `maxChars` is an estimate. |

`sanitizeToolErrors` only rewrites POSIX paths under common roots (`/Users`, `/home`, `/var`,
`/tmp`, `/private`, `/etc`, `/opt`, `/srv`, `/Volumes`, `/mnt`, `/root`, `/app`, `/workspace`,
`/workspaces`) and Windows drive paths. Other paths pass through unchanged.

`historyWindow` changes what the model receives on each request; it does not delete stored memory.
Use [memory compaction](/sdk/memory) when the stored session itself must shrink.

## Lifecycle hooks

Import from `@anvia/extensions/hooks`. Each factory returns an `AgentLifecycle`; combine several in
the `lifecycle` array. Callbacks are awaited, and a callback that throws is not caught by the hook,
so keep reporting code from failing the run.

| Factory | Callback | Reports |
| --- | --- | --- |
| `usageHook({ onReport })` | once per run | `{ runId, status, steps, toolCalls, toolFailures, durationMs, usage }` |
| `costHook({ pricing, onCost })` | once per run | `{ runId, status, currency, usage, cost, budgetExceeded }`; `currency` defaults to `'USD'` |
| `auditHook({ onEvent })` | per event | `run.start`, `step.finish`, `tool.start`, `tool.finish`, `run.finish`, `run.error` with timestamps |
| `jsonlHook({ filePath })` or `jsonlHook({ write })` | per event | The audit events above as newline-delimited JSON, with an optional `redactor` |
| `consoleHook()` | per event | Readable log lines prefixed `[anvia]` through `console.log` or your `writer` |

Tool inputs and outputs are **excluded** by default. Opt in with `includeToolInput` and
`includeToolOutput` (`auditHook`, `jsonlHook`) or `logToolInput` and `logToolOutput`
(`consoleHook`). `jsonlHook({ filePath })` creates the parent directory and appends lines in order.

### Cost

`pricing` is per million tokens:

```ts
import { costHook } from '@anvia/extensions/hooks'

const cost = costHook({
  pricing: {
    inputPerMillion: 2.5,
    outputPerMillion: 10,
    cachedInputPerMillion: 0.25, // defaults to inputPerMillion
    cacheCreationInputPerMillion: 3.125, // defaults to inputPerMillion
  },
  budget: 0.5,
  onBudgetExceeded: (report) => console.warn('Run over budget', report.runId, report.cost.totalCost),
  onCost: (report) => console.log(report.cost.totalCost, report.currency),
})
```

Cached and cache-creation tokens are treated as subsets of `inputTokens`, so uncached input is
`inputTokens − cachedInputTokens − cacheCreationInputTokens`. With `budget` and `onBudgetExceeded`,
cumulative cost is checked after each step and the callback fires once per run when the total goes
over the budget. It reports; it does not stop the run. `calculateUsageCost(usage, pricing)` returns
the same breakdown for any `Usage` value. The numbers are estimates from your prices, not provider
invoices.
