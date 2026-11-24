# Releases

The reviewed source release is `@anvia/client` **1.9.0**.

## Changes in 1.9.0

Reviewed `1.7.0` → `1.9.0` against SDK source on 2026-11-23. Adds durable run status, subscription, and steering to the chat controller; documents `resolveMemoryWrite`; maps settled status events from snapshots; supports per-field payload budgets, `Retry-After`, and small status events.

## Changes through 1.7.0

Reviewed `1.2.0` → `1.7.0` against SDK source on 2026-11-04. Added durable discovery, queues, graphs, custom tasks, and operations support, followed by multimodal prompts and compatibility with compaction and goals. Queued steering is available through `DurableClient.steer()`; releases now accept Durable 0.8–0.13 for goal controls, continuing rounds, tracing, and the payload/agent-compatibility changes. HTTP submission types exclude server-owned trace context. Stream readers hardened malformed-frame handling and SSE parsing, the protocol gained `message_reset`, and `@anvia/client/durable-chat` added a `useChat` transport for durable runs. See [Durable HTTP](/packages/durable/http) and [Durable chat transport](/packages/client/durable-chat).

See the [source changelog](https://github.com/anvia-hq/anvia/blob/7aa42c0a16c14cd96e42e503a2dd4c68a2ba9488/packages/client/CHANGELOG.md) for individual release entries. The reviewed version is a source baseline; consult npm for the currently published tag.

| Version | Summary |
| --- | --- |
| `1.7.0` | Added `@anvia/client/durable-chat`, a `ClientTransport` adapter for `useChat` over `@anvia/durable`, with interaction routing, run-ID/sequence resume, explicit run controls, and `DurableBusyError` for HTTP 409. `DurableHttpError` now exposes `status`, `code`, `field`, and the server message; the optional Durable peer range accepts 0.13. |
| `1.6.0` | Added the validated `message_reset` stream event for retried unfinished generations. The reducer clears the message's parts, metadata, and generation state while retaining its ID and role. Upgrade server and frontend Client packages together. |
| `1.5.0` | Hardened JSONL and SSE readers: malformed frames are skipped and reported through `onParseError` (or thrown with `strict: true`), SSE parsing follows the event-stream format including multi-line data and CRLF/LF/CR, and `readSseFrames`, `EventStreamParseError`, and `EventStreamReadOptions` were exported. Durable client streams parse strictly. |
| `1.2.0` | Exported the `isJsonValue` JSON-safety guard so servers and applications can validate stream payloads with the same rules the client protocol uses. |
| `1.0.11` | Updated the Core dependency to `1.0.10`. |
| `1.0.10` | Hydrated persisted assistant usage, context usage, and sources into replayed UI messages while keeping per-generation usage separate from aggregate run usage, and exposed aggregate run usage as `useChat().runUsage` and completion usage as `useCompletion().usage`. |
| `1.0.9` | Updated the Core dependency to `1.0.9`. |
| `1.0.8` | Updated the Core dependency to `1.0.8`. |
| `1.0.7` | Updated the Core dependency to `1.0.7`. |
| `1.0.6` | Updated the Core dependency to `1.0.6`. |
| `1.0.5` | Declared and verified Bun 1.3.14 runtime compatibility for Client and Server streaming. |
| `1.0.4` | Updated the Core dependency to `1.0.4`. |
| `1.0.3` | Updated the Core dependency to `1.0.3`. |
| `1.0.2` | Updated the Core dependency to `1.0.2`. |
| `1.0.1` | Updated the Core dependency to `1.0.1`. |
| `1.0.0` | Introduced the `anvia.client.v3` request/event contract, typed `interaction_response` requests, public interaction state, and server-owned continuation boundaries. Added original, compacted, retained, and result token counts to memory-compaction events and terminal metadata. |
| `1.0.0-rc.9` | Synchronized the framework-neutral client layer with the Anvia 1.0 release-candidate train. |

## Upgrade checks

- Add `type: 'messages'` to initial chat requests.
- Handle `type: 'interaction_response'` only on routes that own a secure continuation registry.
- Upgrade `@anvia/core`, `@anvia/server`, `@anvia/react`, and `@anvia/react-ui` together.
- Clear or migrate persisted v2 chat state before enabling v3 automatic resume.
- Update custom `memory_compaction` decoders for the required token-count fields.
- Handle `message_reset` in custom reducers, or use `applyClientStreamEvent()`; old validators reject it.
- Decide which malformed frames may be skipped. Use `onParseError` for recovery or `strict: true` to fail the stream; durable streams are always strict.
- When using the durable chat adapter, persist the durable run ID and sequence as the resume cursor and call the controller for cancellation and retries.

Read the complete [Client changelog](https://github.com/anvia-hq/anvia/blob/main/packages/client/CHANGELOG.md).
