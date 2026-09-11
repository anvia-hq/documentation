# Releases

The current stable release is `@anvia/client` **1.2.0**.

| Version | Summary |
| --- | --- |
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

Read the complete [Client changelog](https://github.com/anvia-hq/anvia/blob/main/packages/client/CHANGELOG.md).
