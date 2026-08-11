# Production checklist

Treat the provider client as infrastructure and the selected model as a tested application dependency.

## Configuration

- Keep API keys and provider clients in server-only modules.
- Require either `apiKey` or a preconfigured SDK `client` at startup.
- Make `completionApi` explicit when a deployment depends on Responses or Chat behavior.
- Keep custom `baseUrl` and headers in trusted deployment configuration.
- Use an application allow-list for selectable model IDs.

## Capability tests

- Smoke test the exact endpoint, adapter, and model ID.
- Test both `.send()` and `.stream()` when the UI streams output.
- Exercise required tool calls and complete streamed tool arguments.
- Validate output-schema behavior before relying on parsed product data.
- Test image, document, embedding, speech, or transcription requests with representative media.
- Treat model listing as inventory, not capability proof.

## Reliability

- Bound request time, retries, and concurrency at the application boundary.
- Retry only transient failures and use idempotency around downstream writes.
- Move bulk embeddings and slow media work to durable workers.
- Keep one embedding model and vector dimension configuration per index.
- Avoid silently switching provider, adapter, or model after a failure.

## Security and data

- Validate tool permissions outside model arguments.
- Remove secrets and unnecessary personal data before provider requests.
- Keep raw images and audio in object storage, not memory or traces.
- Apply access control and retention policy to transcripts and generated assets.
- Return safe application errors instead of raw provider responses.

## Observability

Record the selected provider, model, adapter, latency, usage, error class, and application request ID. Attach [Lens](https://anvia.dev/docs/packages/lens/overview), [Langfuse](https://anvia.dev/docs/packages/langfuse/overview), or another Anvia observer when model and tool traces are needed. Choose payload capture deliberately; prompts, documents, images, transcripts, and tool results can contain sensitive data.

