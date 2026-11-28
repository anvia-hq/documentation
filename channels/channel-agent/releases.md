# Releases

The current release of `@anvia/channel-agent` on npm is **0.5.0**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.5.0` | Requires `@anvia/core` `^1.21.0`, redacts embedded credentials in approval previews, and keeps actions on placeholder edits. Also validates and reports `PartialDeliveryError` on multi-part provisional deliveries, routes interaction cancel store errors through `onError`, and propagates stream abort reasons accurately. Updated `@anvia/channel` to `0.5.0`. |
| `0.4.3` | Added `runTimeoutMs` (default five minutes) to bound hung runs, and deletes the streaming placeholder when attachment delivery fails. |
| `0.4.2` | Finishes delivering resumed interaction outcomes during shutdown before stopping the adapter. Refreshed dependencies and switched declaration generation to `tsc` for TypeScript 7. |
| `0.4.1` | Exported `ChannelAgentCommandHandler` from the package entrypoint for typed per-command overrides. |
| `0.4.0` | Added per-command configuration, complete acknowledgement-reaction cleanup with `unreact()`, Discord interaction-webhook responses, and integration with outbound rate limiting (`createRateLimitedChannel()` and Telegram 429 retries). Updated `@anvia/channel` to `0.4.0`. |
| `0.3.0` | Added opt-in cross-platform slash commands and acknowledgement reactions. Updated `@anvia/channel` to `0.3.0`. |
| `0.2.0` | Converted public prompt, rendering, parsing, delivery, and interaction-store callbacks to request objects. Updated `@anvia/channel` to `0.2.0`. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/channel-agent/CHANGELOG.md).
