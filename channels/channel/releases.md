# Releases

The current workspace release is `@anvia/channel` **0.4.0**. Channels packages are not yet
published to npm; these versions describe the source workspace.

| Version | Summary |
| --- | --- |
| `0.4.0` | Completed the reaction lifecycle with `unreact()`, added outbound pacing with `createRateLimitedChannel()`, and supplied the shared contracts used by acknowledgement cleanup and platform command delivery. |
| `0.3.0` | Added acknowledgement reactions and the cross-platform `ChannelCommandEvent` used for slash commands. |
| `0.2.0` | Converted public helpers and callbacks from positional arguments to request objects. `ChannelAgentExecutor.resume()` retained its positional shape for Core Agent compatibility. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/channel/CHANGELOG.md).
