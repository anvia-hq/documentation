# Toolkits

Each toolkit factory returns a core [`Toolkit`](/sdk/tools/toolkits). Pass it in `Agent({ tools })`
next to ordinary tools. Every factory accepts the toolkit options `include`, `exclude`, `prefix`,
`requiresApproval`, `timeoutMs`, and `instructions` in addition to its own options.

- `include` and `exclude` take the unprefixed tool names listed below.
- A toolkit-level `requiresApproval` **replaces** each selected tool's own setting. Passing `false`
  removes the default approval from `shell`'s `run_command`, `delete_file`, and `git_commit`.
- `instructions: false` omits the toolkit's default instructions; a string replaces them.

## Toolkit reference

| Factory | Tools | Requires approval by default | Key defaults |
| --- | --- | --- | --- |
| `filesystem({ rootDir })` | `read_file`, `list_files`, `grep`; plus `write_file`, `edit_file`, `delete_file` unless `readOnly: true` | `delete_file` | `readOnly: false`, `maxFileBytes: 512_000`, `maxEntries: 200`, `maxMatches: 100`, `maxScannedFiles: 5_000`, `maxMatchLineChars: 500` |
| `shell({ rootDir })` | `run_command` | `run_command` | `mode: 'execFile'`, `allowSubdirCwd: true`, `inheritEnv: false`, `timeoutMs: 30_000`, `maxOutputBytes: 256_000`, `maxOutputChars: 16_000` |
| `git({ rootDir })` | `git_status`, `git_diff`, `git_log`, `git_show`, `git_branch`; plus `git_stage`, `git_commit` when `readOnly: false` | `git_commit` | `readOnly: true`, `timeoutMs: 15_000`, `maxOutputBytes: 512_000`, `maxOutputChars: 16_000`, `gitBinary: 'git'` |
| `httpClient({ baseUrl })` or `httpClient({ allowedHosts })` | `http_request` | none | all six methods allowed, `maxBytes: 512_000`, `maxChars: 16_000`, `maxRedirects: 3`, `timeoutMs: 15_000` |
| `webFetch()` | `web_fetch` | none | `maxBytes: 1_000_000`, `maxChars: 16_000`, `maxRedirects: 5`, `timeoutMs: 15_000`, user agent `anvia-web-fetch/0.1` |
| `webSearch({ provider })` | `web_search` | none | `maxResults: 5`; model-supplied counts capped at `maxResultsLimit` (default the larger of 10 and `maxResults`) |
| `todo()` | `todo_read`, `todo_write` | none | `maxItems: 50`, in-memory store |
| `scratchpad()` | `note_get`, `note_set`, `note_delete`, `note_list` | none | in-memory store with `maxEntries: 100` and `maxValueChars: 16_000` |
| `datetime()` | `current_time`, `convert_timezone`, `date_math` | none | `defaultTimeZone: 'UTC'` |
| `math()` | `calculate` | none | `maxExpressionLength: 500`, `maxDepth: 64` |

### Files

`filesystem` resolves `rootDir` with `realpath` and rejects any path, including a symlink target,
that leaves it. `grep` skips `.git`, `node_modules`, and binary files. `delete_file` refuses the root,
symlinks, and directories.

### Shell commands

`shell` runs one executable with an argument array (`mode: 'execFile'`) and no shell interpolation.
`mode: 'shell'` runs the command through `/bin/sh -c`. Narrow what can run with `allowedCommands`
(an empty array is rejected) and `deniedCommands`. Child processes get a minimal environment (`PATH`,
`HOME`, locale, and temp variables) unless you set `inheritEnv: true`; pass extra variables through
`env`.

### Git

The default toolkit only inspects the repository. `readOnly: false` adds `git_stage` and
`git_commit`; the commit runs `git commit -m`, so repository hooks execute.

### HTTP and web fetch

`httpClient` requires `baseUrl` or a non-empty `allowedHosts`. With only `baseUrl`, requests are
limited to that host and origin. Headers you configure in `headers` (for example an authorization
token) are added to every request, override headers chosen by the model, and are dropped on
cross-origin redirects. Narrow methods with `allowedMethods`.

`webFetch` reads one `http(s)` URL and converts HTML to readable text, or returns the raw body with
`format: 'raw'`. Both toolkits share the URL protections described in
[Security](/packages/extensions/security#network-tools).

### Web search providers

`webSearch` needs a provider. Each provider calls its API with `fetch` and reads no environment
variables; pass keys from your own configuration.

| Provider | Required option | Default base URL |
| --- | --- | --- |
| `tavily({ apiKey })` | `apiKey` | `https://api.tavily.com` |
| `exa({ apiKey })` | `apiKey` | `https://api.exa.ai` |
| `brave({ apiKey })` | `apiKey` | `https://api.search.brave.com/res/v1` |
| `serper({ apiKey })` | `apiKey` | `https://google.serper.dev` |
| `perplexity({ apiKey })` | `apiKey` | `https://api.perplexity.ai` |
| `firecrawl({ apiKey })` | `apiKey` | `https://api.firecrawl.dev/v1` |
| `jina()` | none (`apiKey` optional) | `https://s.jina.ai` |
| `searxng({ baseUrl })` | `baseUrl` | none; your SearXNG instance |

Providers time out after 15 seconds by default (`timeoutMs`), refuse redirects, and cap responses at
2 MB. Implement `WebSearchProvider` (`name` and `search(request)`) for another backend.

```ts
import { webSearch, tavily } from '@anvia/extensions/tools/web-search'

const search = webSearch({
  provider: tavily({ apiKey: process.env.TAVILY_API_KEY! }),
  maxResults: 5,
})
```

### Task lists, notes, dates, and math

- `todo` keeps a list of `{ id, content, status }` items (`pending`, `in_progress`, `completed`,
  `cancelled`). `todo_write` replaces the list and rejects duplicate IDs.
- `scratchpad` stores string notes by key (keys up to 128 characters).
- Both default to in-memory stores that live as long as the toolkit instance. Pass `store` with your
  own `TodoStore` or `ScratchpadStore` to persist or scope them, for example per session.
- `datetime` uses IANA time zones. `date_math` adds, subtracts, or diffs timestamps.
- `math` evaluates expressions with its own parser, never `eval`. `evaluateMathExpression` is
  exported for direct use.

## `timeoutMs` on shell, git, HTTP, and fetch

For `shell` and `git`, `timeoutMs` is the child-process timeout (30 and 15 seconds by default). It
is not passed to `createToolkit`, so no extra toolkit-level wrapper is added. For `httpClient` and
`webFetch`, `timeoutMs` bounds the whole request including redirects (15 seconds by default); an
explicit value is also passed to `createToolkit`. Other toolkits apply `timeoutMs` only as the
toolkit wrapper.

## Tool wrappers

The wrappers in `@anvia/extensions/tools` accept a single tool or a toolkit and return the same
type. When wrapping a toolkit, `tools` limits the wrapper to specific tool names. Approval settings of
the wrapped tools are preserved.

| Wrapper | Required options | Defaults and behavior |
| --- | --- | --- |
| `withToolCache(target, { ttlMs })` | `ttlMs` | `maxEntries: 100` with least-recently-used eviction. The key is the tool name plus its arguments. |
| `withToolTimeout(target, { timeoutMs })` | `timeoutMs` | Fails the call after the timeout; optional `message`. |
| `withToolRetry(target, options)` | none | `maxAttempts: 3` (including the first call), `backoffMs: 250`, `backoffFactor: 2`, `maxBackoffMs: 5_000`. Retries every error unless the run is aborted or `retryOn` returns `false`. |
| `withToolRateLimit(target, { maxCalls, windowMs })` | `maxCalls`, `windowMs` | Sliding window per tool name; over the limit the call fails with an error. |
| `withToolSummary(target, options)` | none | Adds a required `summary` string parameter to each tool schema, asking the model for a 2–6 word label, then strips it before the tool runs. `onSummary` receives `{ toolName, summary, args }`. Set `field`, `description`, or `required: false` to change it. |

```ts
import { withToolRetry, withToolSummary } from '@anvia/extensions/tools'
import { webFetch } from '@anvia/extensions/tools/web-fetch'

const fetchTools = withToolSummary(withToolRetry(webFetch(), { maxAttempts: 2 }))
```

Use retries only for idempotent tools. A cache is shared by every caller of the wrapped instance, so
do not cache results that depend on the user or tenant unless those values are part of the
arguments.
