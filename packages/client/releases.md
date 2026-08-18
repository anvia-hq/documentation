# Releases

The current source manifest is `@anvia/client` **1.0.0-rc.2**. The RC3 branch changes are not published until the synchronized release commit.

| Version | Summary |
| --- | --- |
| `v1-rc3` source | Introduced the `anvia.client.v3` request/event contract, typed `interaction_response` requests, public interaction state, and server-owned continuation boundaries. |
| `1.0.0-rc.2` | Synchronized the framework-neutral client layer with the Anvia 1.0 release-candidate train. |

## Upgrade checks

- Add `type: 'messages'` to initial chat requests.
- Handle `type: 'interaction_response'` only on routes that own a secure continuation registry.
- Upgrade `@anvia/core`, `@anvia/server`, `@anvia/react`, and `@anvia/react-ui` together.
- Clear or migrate persisted v2 chat state before enabling v3 automatic resume.

Read the complete [Client changelog](https://github.com/anvia-hq/anvia/blob/v1-rc3/packages/client/CHANGELOG.md).
