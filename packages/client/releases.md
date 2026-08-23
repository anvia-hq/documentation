# Releases

The current published manifest is `@anvia/client` **1.0.0-rc.9**. Changes described as next RC are available from `staging` and publish with the next synchronized release commit.

| Version | Summary |
| --- | --- |
| Next RC source | Introduced the `anvia.client.v3` request/event contract, typed `interaction_response` requests, public interaction state, and server-owned continuation boundaries. Added original, compacted, retained, and result token counts to memory-compaction events and terminal metadata. |
| `1.0.0-rc.9` | Synchronized the framework-neutral client layer with the Anvia 1.0 release-candidate train. |

## Upgrade checks

- Add `type: 'messages'` to initial chat requests.
- Handle `type: 'interaction_response'` only on routes that own a secure continuation registry.
- Upgrade `@anvia/core`, `@anvia/server`, `@anvia/react`, and `@anvia/react-ui` together.
- Clear or migrate persisted v2 chat state before enabling v3 automatic resume.
- Update custom `memory_compaction` decoders for the required token-count fields.

Read the complete [Client changelog](https://github.com/anvia-hq/anvia/blob/staging/packages/client/CHANGELOG.md).
