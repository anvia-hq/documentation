# Production checklist

Treat `MistralClient` as infrastructure and each selected completion, embedding, or OCR model as a tested application dependency.

## Configuration

- Keep API keys and provider clients in server-only modules.
- Fail startup when required credentials or model configuration is missing.
- Keep `baseUrl` in trusted deployment configuration.
- Use an application allow-list for selectable completion model IDs.
- Keep prompts, tool policy, and fallback decisions outside the provider adapter.

## Capability tests

- Smoke-test the exact account, endpoint, and model ID.
- Test `agent.generate(...)` and fully consumed `agent.stream(...)` runs when the UI streams output.
- Exercise required tool calls, complete streamed arguments, and handler failures.
- Validate output-schema behavior with representative and adversarial input.
- Confirm that unsupported chat image and document inputs fail as expected.
- Verify embedding dimensions against the target vector index.
- Run OCR against representative file types, sizes, scans, tables, and page ranges.

Model listing is inventory, not a substitute for these tests.

## Reliability

- Bound request time and application concurrency.
- Retry only transient failures, using backoff and jitter.
- Keep side-effecting tools idempotent or guarded by application state.
- Move bulk embedding and slow OCR work to durable workers.
- Avoid silently changing provider or model after a failure.
- Record enough application state to reconcile a timed-out tool or OCR job safely.

## Security and data

- Authorize every tool call independently of model-supplied arguments.
- Remove secrets and unnecessary personal data before provider requests.
- Use short-lived signed URLs for private OCR inputs.
- Define provider-file expiry and cleanup for byte uploads.
- Keep `includeImageBase64` off unless the workflow needs extracted images.
- Apply access control and retention policy to prompts, OCR results, and derived knowledge.

## Observability

Record the selected provider, model, endpoint class, latency, normalized usage, error class, and application request ID. Attach [Lens](/packages/lens), [Langfuse](/packages/langfuse), or another Anvia observer when model and tool traces are needed.

Choose payload capture deliberately. Prompts, tool arguments, tool results, and OCR content may contain credentials, personal data, or private documents. Prefer normalized application errors over returning raw Mistral responses to users.
