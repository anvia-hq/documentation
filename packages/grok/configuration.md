# Configuration

## Client options

```ts
const grok = new GrokClient({
  apiKey: process.env.XAI_API_KEY!,
  baseUrl: 'https://api.x.ai/v1',
  headers: { 'X-Application': 'research-service' },
  fetch: customFetch,
})
```

| Option | Purpose |
| --- | --- |
| `apiKey` | Credential for completion and media requests. |
| `baseUrl` | Defaults to `https://api.x.ai/v1`. |
| `headers` | Default SDK and media request headers. |
| `client` | Reuses an initialized OpenAI-compatible SDK client. |
| `fetch` | Supplies transport for SDK, image URLs, TTS, and STT. |

When an injected client is used, pass the required `http` object with the media credential and optional base URL, headers, and fetch implementation. Select Responses or Chat explicitly on `completionModel({ modelId, api })`.

## Completion options

Provider controls belong in `providerOptions`:

```ts
const response = await model.completion({
  chatHistory,
  documents: [],
  tools: [],
  providerOptions: {
    reasoning: { effort: 'high' },
  },
})
```

Provider-tool factories are preferable to manually authored `providerOptions.tools` because they validate xAI-specific configuration. Legacy raw tools are still merged by the Responses adapter.

## Media transport

Without `options.fetch`, the package uses a compatible `fetch` from the injected client or `globalThis`. Media factories can be constructed even when no fetch is available, but their request fails when transport is needed.

## Runtime

The package is ESM, uses Node binary utilities, depends on `@anvia/openai` and the official `openai` SDK, and should use matching Anvia release-candidate versions. Validate binary, `FormData`, and fetch support in edge runtimes.
