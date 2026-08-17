# Production guidance

Treat the Anthropic adapter as the model boundary. The application still owns credentials, model policy, authorization, retries, observability, and user-facing error handling.

## Create clients at a stable boundary

Create one client per runtime boundary or request scope. Avoid constructing a new SDK client inside every prompt, and avoid exporting a mutable client that carries user-specific state.

```ts
import { AnthropicClient } from '@anvia/anthropic'

const anthropic = new AnthropicClient({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export const supportModel = anthropic.completionModel({
    modelId: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514'
})
```

Validate required environment variables at startup. Keep model selection in configuration so a rollout or rollback does not require rewriting agents.

## Bound every run

Set `maxTokens` for direct completions and a small agent `maxTurns` value. Validate upload sizes before sending image or PDF content, and cancel streams when the caller disconnects.

Provider errors should be logged with a request or trace ID, then translated into a safe application error. Do not expose raw SDK errors or provider credentials to the browser.

## Observe the provider boundary

Attach Lens, Langfuse, or another Anvia observer to capture model latency, tool calls, errors, model identity, and normalized token usage. Anthropic usage includes cache-read and cache-creation token details when the provider reports them.

Use a deliberate capture policy. Prompts, images, PDFs, tool results, and reasoning content may contain private data and should not be recorded by default merely because tracing is enabled.

## Test the exact deployment

Maintain a small live-provider suite, gated by credentials, for the capabilities used in production:

- one non-streaming completion;
- one stream that reaches a final event and reports usage;
- one required tool call with complete arguments;
- one image or PDF request when multimodal input is enabled;
- one extractor call when structured data is required;
- one Vertex request per deployed project and region, when applicable.

Use fake Anvia completion models for normal agent unit tests. Reserve live tests for adapter compatibility, model behavior, and deployment credentials.

## Roll out model changes deliberately

Pin exact model IDs for stable workloads. Before switching, compare task success, tool accuracy, latency, token usage, refusal behavior, and multimodal performance against a representative eval set.

Do not treat `listModels()` as a capability check or automatically route production traffic to the newest listed model. Model availability is inventory; application readiness is an evaluated policy decision.

## Production checklist

- Credentials remain server-side and are validated at startup.
- The provider and model ID are visible in traces.
- Token, turn, upload-size, and request-time limits are bounded.
- Tool handlers enforce product authorization independently of the model.
- Reasoning and multimodal payloads follow explicit retention rules.
- Every required capability has a live smoke test.
- Fallbacks and retries are visible, bounded, and tested.
