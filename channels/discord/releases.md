# Releases

The current release of `@anvia/discord` on npm is **0.3.4**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.3.4` | Acknowledges every interaction (unsupported types get an ephemeral reply and an `onError` report), posts the answer to the channel when a deferred reply cannot be edited, and validates command payloads at runtime. Updated `@anvia/channel` to `0.5.0`. |
| `0.3.3` | Updated to `@anvia/channel` `0.4.2`. |
| `0.3.2` | Kept deferred replies scoped to their originating command, preserved files in deferred replies, and cleaned up unanswered deferrals. |
| `0.3.1` | Refreshed dependencies and switched declaration generation to `tsc` for TypeScript 7. |
| `0.3.0` | Added reaction removal, routed command responses through the Discord interaction webhook, and updated to `@anvia/channel` `0.4.0`. |
| `0.2.0` | Added acknowledgement reactions and normalized slash-command events; updated to `@anvia/channel` `0.3.0`. |
| `0.1.2` | Updated to the request-object APIs in `@anvia/channel` `0.2.0`. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/discord/CHANGELOG.md).
