# Production checklist

Treat `JevClient` as infrastructure and each decision model ID as a tested dependency.

## Configuration

- Keep `TYPESAFE_API_KEY` and clients in server-only modules.
- Fail startup when credentials or the model ID are missing.
- Keep `baseUrl` and `headers` in trusted configuration.
- Use an allow-list for any user-selectable model ID.

## Capability tests

- Smoke-test the exact account, endpoint, and model ID with each question type you use.
- Exercise score rubrics with strings, numbers, and objects, since non-string criteria are wrapped on the wire.
- Confirm the largest choice and rubric you ship stays within 255 options and 10 levels.
- Test the failure paths: invalid key, timeout, and a cancelled request.

## Cost and reliability

- Each multi-label option is an extra question and may add billed usage. Prefer a `choice` when options are mutually exclusive.
- Enable `retries` deliberately. The adapter turns off SDK retries, so core owns them.
- Bound `decideBatch()` concurrency to your rate limits and handle every failed item.
- Record `usage` per request for cost tracking.

## Data and security

- Send only the state a decision needs and remove secrets and unnecessary personal data.
- Do not act on a decision alone for high-impact outcomes; add thresholds and review paths.
- Do not return `rawResponse` to end users or log it where retention is uncontrolled.
- Prefer normalized application errors over raw SDK errors in responses.

See [Typed decisions: Production](/sdk/decisions/production) for the provider-neutral checklist.
