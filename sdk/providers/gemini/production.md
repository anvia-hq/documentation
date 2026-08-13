# Production guidance

Treat the Gemini adapter as the model boundary. The application still owns credentials, project selection, model policy, authorization, retries, observability, media handling, and user-facing errors.

## Create clients at a stable boundary

Create one client per runtime boundary or request scope rather than rebuilding the Google SDK inside every prompt:

```ts
import { GeminiClient } from '@anvia/gemini'

const gemini = new GeminiClient({
  apiKey: process.env.GEMINI_API_KEY,
})

export const supportModel = gemini.completionModel(
  process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
)
```

Validate required environment values at startup. Keep model selection in reviewed configuration so a rollout or rollback does not require rewriting agents.

## Bound every request

Set maximum output tokens for direct completions and a small agent `maxTurns` value. Validate upload ownership, size, duration, dimensions, and MIME type before loading media. Cancel streamed work when the caller disconnects.

Translate provider and SDK errors into safe application errors. Log an internal request or trace ID, but do not expose raw Google errors, credentials, project details, or media payloads to the browser.

## Observe deliberately

Attach Lens, Langfuse, or another Anvia observer to record latency, selected provider and model, tool calls, errors, and normalized token usage. Gemini usage includes cached input, tool-use input, and reasoning-output details when Google reports them.

Choose a deliberate capture policy. Prompts, tool results, reasoning, PDFs, images, audio, and video may contain private data. Avoid full payload capture by default and keep raw media out of traces.

## Test each model contract

Maintain a small live-provider suite, gated by credentials, for the capabilities used in production:

- one non-streaming completion;
- one stream that reaches a final event and reports usage;
- one required tool call with complete schema-valid arguments;
- one parsed completion when structured output is required;
- one request for every enabled image or document input type;
- one embedding batch with the configured dimensions and task type;
- one image-generation request for each enabled factory;
- one transcription request for every accepted audio format;
- one Vertex request per deployed project and location, when applicable.

Use fake Anvia models for normal agent and pipeline unit tests. Reserve live tests for provider compatibility, credentials, quotas, and evaluated model behavior.

## Roll out model changes deliberately

Pin explicit model IDs for stable workloads. Before switching, compare task success, tool accuracy, schema validity, latency, token usage, safety behavior, and multimodal performance against representative examples.

Do not automatically route production traffic to the newest result from `listModels()`. Inventory is not a capability test or an application approval policy.

## Production checklist

- Gemini API keys or Google credentials remain server-side.
- Vertex project, location, and IAM policy are validated per environment.
- Provider and model IDs are visible in safe operational metadata.
- Token, turn, timeout, batch, and media-size limits are bounded.
- Tool handlers enforce product authorization independently of the model.
- Reasoning and multimodal payloads follow explicit retention rules.
- Every required capability has a live smoke test.
- Retries and fallbacks are bounded, visible, and covered by evaluations.
