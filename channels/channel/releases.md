# Releases

The current release of `@anvia/channel` on npm is **0.5.0**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.5.0` | Upgraded to `@anvia/core` 1.21.0, added the zero-dependency [`@anvia/channel/adapter`](/channels/channel/custom-adapter#adapter-utilities) utilities for adapter authors, and preserved the `RawEvent` type parameter on `createRateLimitedChannel()`. |
| `0.4.2` | `splitChannelMessage` attaches `replyToMessageId` to the first part only, so a long reply is one reply followed by continuations. |
| `0.4.1` | Refreshed dependencies and switched declaration generation to `tsc` for TypeScript 7. |
| `0.4.0` | Completed the reaction lifecycle with `unreact()` and automatic acknowledgement cleanup, routed Discord command responses through the interaction webhook, added per-command configuration, and added outbound rate limiting: Telegram HTTP 429 retries and `createRateLimitedChannel()`. |
| `0.3.0` | Added acknowledgement reactions and the cross-platform `ChannelCommandEvent` used for slash commands. |
| `0.2.0` | Converted public helpers and callbacks from positional arguments to request objects. `ChannelAgentExecutor.resume()` retained its positional shape for Core Agent compatibility. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/channel/CHANGELOG.md).
