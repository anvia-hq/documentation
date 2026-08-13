# Production checklist

Ship a compatible endpoint as a tested infrastructure dependency, not as an interchangeable URL.

## Configuration

- Keep `baseUrl`, credentials, headers, adapter, and model ID in server-side configuration.
- Validate required variables and the endpoint URL at startup.
- Use HTTPS outside intentional local development.
- Pin `completionApi` instead of relying on the custom-endpoint default.
- Allow-list model IDs when users or tenants can choose a model.
- Treat endpoint, adapter, model, and important `params` as one release unit.

## Capability gates

- Run direct and streaming completion tests.
- Test required tools, streamed arguments, and multi-turn tool replay.
- Validate schema output locally when product state depends on it.
- Test representative images, documents, embeddings, audio, or transcription separately.
- Confirm usage mapping before using provider counts for quotas or billing.
- Do not treat `/models` as capability discovery.

## Reliability

- Bound timeouts, concurrency, and retries at the application boundary.
- Retry only failures known to be transient for this provider.
- Make downstream tool writes idempotent before retrying an agent run.
- Rate-limit by tenant before traffic reaches a shared gateway.
- Avoid silent adapter, endpoint, or model fallback.
- Re-run the compatibility suite after endpoint, model, gateway, or package changes.

## Security and data

- Never expose provider keys or privileged gateway headers to browser code.
- Do not let model output choose an arbitrary `baseUrl`, credential, or routing header.
- Restrict outbound endpoints when configuration can vary by tenant.
- Remove secrets and unnecessary personal data before sending requests.
- Apply explicit retention policy to prompts, media, reasoning metadata, and tool results.
- Return application-safe errors instead of raw provider payloads.

## Observability

Record the provider, endpoint identity, model ID, adapter, latency, normalized usage, status code, error class, and application request ID. Do not log credentials, full authorization headers, or unredacted payloads.

Attach [Lens](/packages/lens), [Langfuse](/packages/langfuse), or another Anvia observer when runs
need model and tool traces. Choose safe or full payload capture deliberately; a compatible gateway
can receive the same sensitive content as a first-party provider.

## Rollout

Introduce a new compatible deployment behind controlled routing. Compare quality, latency, tool accuracy, schema validity, and cost with the current model before increasing traffic. Keep rollback explicit: switch to a separately configured and separately tested model boundary rather than mutating a failed request mid-run.
