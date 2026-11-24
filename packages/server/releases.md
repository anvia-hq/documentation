# Releases

The reviewed source release is `@anvia/server` **1.5.0**. The entries below preserve notable v0 transport milestones.

## Changes in 1.5.0

Reviewed `1.3.6` → `1.5.0` against SDK source on 2026-11-23. Accepts a store-only Durable client as the HTTP backend (task submission answers 503), serves memory-write reconciliation, per-field payload budgets, body-limit warnings, and `Retry-After` capacity hints.

## Changes through 1.3.6

Reviewed `1.1.4` → `1.3.6` against SDK source on 2026-11-04. Added authorized durable run, graph, and task routes and operational controls, then multimodal prompts, goal agent authorization, `POST /runs/:id/steer`, and trace context from `trace(request, resource)`. Version 1.3.5 validated resumable cursors, bounded retained closed streams, and rejected reopening a running stream. Version 1.3.6 maps payload limits to HTTP 413 and capacity to 429 with `{ error, code, field? }`. See [Durable HTTP](/packages/durable/http) and [Streaming](/packages/server/streaming).

See the [source changelog](https://github.com/anvia-hq/anvia/blob/e751560f4a02c8989928966c203ed8747c0072fb/packages/server/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.3.6` | Payload-limit admission now ends a durable run in terminal `failed`, and the handler returns 413 with `payload_too_large` or 429 with `capacity_exceeded` as `{ error, code, field? }`. Body-too-large 413 includes the `maxBodyBytes` limit, and retry recomputes inherited history without truncating it. `DurableHttpError` exposes `status`, `code`, `field`, and the server message. |
| `1.3.5` | Validated resumable `after` cursors as nonnegative safe integers and returned a typed 400 `invalid_resumable_after` response. Evicted closed in-memory streams by TTL and count, oldest first, while never evicting running streams. Reopening a running stream now fails without disturbing its history instead of silently discarding it. |
| `1.1.4` | Kept `code`, `retryable`, and JSON-safe `details` on JSONL/SSE error events (including prototype-defined fields `JSON.stringify` drops), degraded non-JSON-safe throws to `{ message }`, and exported `errorEvent`. |
| `1.0.11` | Updated the Client dependency to `1.0.11`. |
| `1.0.10` | Updated the Client dependency to `1.0.10`. |
| `1.0.9` | Updated the Client dependency to `1.0.9`. |
| `1.0.8` | Updated the Client dependency to `1.0.8`. |
| `1.0.7` | Updated the Client dependency to `1.0.7`. |
| `1.0.6` | Updated the Client dependency to `1.0.6`. |
| `1.0.5` | Declared and verified Bun 1.3.14 runtime compatibility for Client and Server streaming. |
| `1.0.4` | Updated the Client dependency to `1.0.4`. |
| `1.0.3` | Updated the Client dependency to `1.0.3`. |
| `1.0.2` | Updated the Client dependency to `1.0.2`. |
| `1.0.1` | Updated the Client dependency to `1.0.1`. |
| `1.0.0` | Aligned framed client responses with protocol v3 so message requests and interaction-response requests can create linked agent stream phases while continuations remain server-owned. |
| `1.0.0-rc.9` | Synchronized Server with the Anvia 1.0 release-candidate train. |
| `0.7.5` | Updated the Core dependency to `0.26.0`. |
| `0.7.4` | Updated the Core dependency to `0.25.1`. |
| `0.7.0` | Carried model-aware context limits and active context usage through UI stream events. |
| `0.6.0` | Added the legacy `createEventStream({ resume })` and `createUIStreamResponse({ resume })` overloads for first-class stream continuation. |
| `0.5.0` | Added resumable event envelopes, replay/tail helpers, and the in-memory resumable stream store. |
| `0.4.6` | Hardened SSE control-field validation alongside transport behavior fixes. |
| `0.4.0` | Added the legacy shared UI message stream protocol and `createUIStreamResponse`. |
| `0.3.1` | Split stream internals, added coverage-gated tests, and removed stack traces from default streamed error events. |
| `0.2.0` | Introduced JSONL and SSE response helpers. |

## Upgrade checks

- Upgrade `@anvia/core` with Server when the changelog lists a dependency alignment.
- Keep clients aligned with envelope and UI-event changes; resumable routes require a resume-aware React client.
- Validate the discriminated `ClientStreamRequest` union and persist interaction continuations server-side; never return trusted continuations to the browser.
- Re-test proxy buffering, content types, cancellation, and custom serializers after transport changes.
- When adopting resume, add shared persistence before enabling it across multiple production replicas.
- Validate `after` with `parseResumableAfter()` and return `resumeAfterErrorResponse()` (or an equivalent 400) for custom resume routes.
- Size in-memory closed-stream retention for the reconnection window; resumed evicted streams report `missing`.
- Map durable payload failures to 413 and capacity to 429, and read `DurableHttpError.code`/`field` rather than matching message text.
- Upgrade the server's Client dependency and browser clients together when `message_reset` is in use.

Read the complete [Server changelog](https://github.com/anvia-hq/anvia/blob/main/packages/server/CHANGELOG.md).
