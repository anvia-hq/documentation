# Production checklist

Treat a decision as an estimate that feeds your logic, not as a fact.

## Design

- Write specific `instructions` and describe every option or rubric level. Vague labels produce vague probabilities.
- Keep question sets small and reuse the same question objects across inputs.
- Use `check` for yes/no gates, `choice` for exclusive routing, `multiLabel` for tagging, and `score` for ordering.
- Pick action thresholds from labeled examples. Provider probabilities and confidence are not calibrated by Anvia.
- Add a human or fallback path for low-confidence or near-threshold answers.

## Safety

- Keep API keys and provider clients on the server.
- Remove secrets and unnecessary personal data from `state` before sending it.
- Never let a decision alone authorize a destructive or irreversible action.
- Do not show `rawResponse` to end users, and apply retention policy to it.

## Reliability

- Enable `retries` deliberately and bound `maxAttempts`. Retries repeat billed calls.
- Pass an `abortSignal` tied to the request or a deadline.
- Choose `decideBatch()` `concurrency` from rate limits, and handle every `failed` item.
- Move large or restart-sensitive batches to a durable queue.
- Check the model's declared limits. Jev allows at most 255 choice options and 10 score levels.

## Testing

- Test the application with an [offline decision model](/sdk/decisions/custom-models) so CI needs no credentials.
- Run a small labeled set against the real model whenever you change instructions, options, or the model ID.
- Record input identifiers, selected labels, probabilities, `usage`, latency, and error class for monitoring.
