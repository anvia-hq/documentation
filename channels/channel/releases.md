# Releases

The current release of `@anvia/channel` on npm is **0.5.0**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.5.0` | Upgraded to `@anvia/core` 1.21.0 and added the zero-dependency `@anvia/channel/adapter` utilities for adapter authors. |
| `0.4.2` | `splitChannelMessage` attaches `replyToMessageId` to the first part only, so a long reply is one reply followed by continuations. |
| `0.4.1` | Refreshed dependencies and switched declaration generation to `tsc` for TypeScript 7. |
| `0.4.0` | Completed the reaction lifecycle with `unreact()`, added outbound pacing with `createRateLimitedChannel()`, and supplied the shared contracts used by acknowledgement cleanup and platform command delivery. |
| `0.3.0` | Added acknowledgement reactions and the cross-platform `ChannelCommandEvent` used for slash commands. |
| `0.2.0` | Converted public helpers and callbacks from positional arguments to request objects. `ChannelAgentExecutor.resume()` retained its positional shape for Core Agent compatibility. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/channel/CHANGELOG.md).
