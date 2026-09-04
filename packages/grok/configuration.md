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

Provider-tool factories are preferable to manually authored `providerOptions.tools` because they validate xAI-specific configuration. Raw `providerOptions.tools` are not merged: the Responses adapter discards them and rebuilds `tools` from the request's canonical `tools` plus provider tools, so the factories always take precedence.

## Media transport

Without `options.fetch`, the package uses a compatible `fetch` from the injected client or `globalThis`. Media factories can be constructed even when no fetch is available, but their request fails when transport is needed.

## Runtime

The package is ESM, uses Node binary utilities, depends on `@anvia/openai` and the official `openai` SDK, and should use Anvia versions with compatible declared dependency ranges. Validate binary, `FormData`, and fetch support in edge runtimes.
