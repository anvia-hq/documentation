# Configuration

## Client options

```ts
const grok = new GrokClient({
  apiKey: process.env.XAI_API_KEY,
  baseUrl: 'https://api.x.ai/v1',
  completionApi: 'responses',
  headers: { 'X-Application': 'research-service' },
  fetch: customFetch,
})
```

| Option | Purpose |
| --- | --- |
| `apiKey` | Credential for completion and media requests. |
| `baseUrl` | Defaults to `https://api.x.ai/v1`. |
| `headers` | Default SDK and media request headers. |
| `completionApi` | Selects `'responses'` or `'chat'`. |
| `client` | Reuses an initialized OpenAI-compatible SDK client. |
| `fetch` | Supplies transport for SDK, image URLs, TTS, and STT. |

When an injected client is used, Grok attempts to reuse its base URL, API key, fetch, and default headers for the xAI-specific media models. Supplying explicit options is clearer when the client hides custom transport state.

## Completion options

Provider controls belong in `additionalParams`:

```ts
const response = await model.completion({
  chatHistory,
  documents: [],
  tools: [],
  additionalParams: {
    reasoning: { effort: 'high' },
  },
})
```

Provider-tool factories are preferable to manually authored `additionalParams.tools` because they validate xAI-specific configuration. Legacy raw tools are still merged by the Responses adapter.

## Media transport

Without `options.fetch`, the package uses a compatible `fetch` from the injected client or `globalThis`. Media factories can be constructed even when no fetch is available, but their request fails when transport is needed.

## Runtime

The package is ESM, uses Node binary utilities, depends on `@anvia/openai` and the official `openai` SDK, and peers on `@anvia/core >=0.7.1 <1.0.0`. Validate binary, `FormData`, and fetch support in edge runtimes.
