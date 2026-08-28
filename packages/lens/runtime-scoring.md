# Runtime scoring

`LensClient.score()` records a score against an existing Lens trace. It uses the client's owned OTLP
logs provider, so applications can make production feedback observable without configuring a
separate evaluation suite or OpenTelemetry logger.

```ts
await lens.score({
  id: feedbackId,
  traceId,
  observationId,
  responseId,
  name: 'user-feedback',
  value: liked ? 1 : 0,
  dataType: 'BOOLEAN',
  source: 'end_user',
  comment,
  metadata: { channel: 'thumbs' },
})
```

Lens v0.9.1 or later preserves `end_user` provenance and displays it separately from
telemetry-generated and internal human evaluations. The API is not limited to like/dislike:

| `dataType` | Accepted `value` | Example |
| --- | --- | --- |
| `BOOLEAN` | `1` or `0` | Helpful/not helpful |
| `NUMERIC` | A finite number | A 1–5 rating or confidence score |
| `CATEGORICAL` | A string | A feedback reason or rubric category |

For Boolean scores, `1` infers a `pass` outcome and `0` infers `fail`. Supply `outcome` and `label`
when the product uses different semantics.

## Make feedback durable and attributable

- A valid 32-character `traceId` is required. Add the optional 16-character `observationId` to
  target a particular span, and `responseId` when feedback applies to a model response.
- Use a stable opaque `id` when a later vote should replace or supersede the same application
  feedback record. Omit it when every submission must remain a separate event.
- Set `source: 'end_user'` only after authenticating and authorizing the feedback request. Lens
  provenance is an observability classification, not proof of user identity or permission.
- Keep tenant and user ownership in application data. If metadata needs an identifier, prefer an
  approved opaque or hashed value over an email address or other raw personal data.

`score()` resolves after the client has queued the log record; it does not force exporter delivery.
Call `lens.flush()` at a short-lived delivery boundary and `lens.close()` during graceful shutdown.
A disabled optional client treats scoring as a no-op, while a closed client rejects new calls.

The client rejects invalid trace or observation IDs, empty names and explicit IDs, non-finite
numbers, values that do not match `dataType`, and comments longer than 2,000 characters.
