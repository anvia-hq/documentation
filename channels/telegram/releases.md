# Releases

The current release of `@anvia/telegram` on npm is **0.3.4**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.3.4` | Retries HTTP 429 responses on multipart uploads, handles pre-aborted signals during rate-limit waits, and classifies audio and video documents by media type. Upgraded to `@anvia/core` 1.21.0 and decomposed parser and polling internals. Updated `@anvia/channel` to `0.5.0`. |
| `0.3.3` | Skips updates whose handler keeps failing after `maxHandlerAttempts` (default 10) and reports them with `poisoned: true`. Group commands must target the bot by default, and rejected commands are dropped instead of forwarded as messages; `allowBareGroupCommands` opts into bare group commands. |
| `0.3.2` | Preserves handler retries when malformed or out-of-order updates share a polling batch. |
| `0.3.1` | Preserves replacement bot reactions when removing an acknowledgement, and makes callback-query acknowledgement best-effort. |
| `0.3.0` | Added reaction removal and bounded retries for eligible Bot API HTTP 429 responses; updated to the shared `@anvia/channel` `0.4.0` command, acknowledgement-cleanup, and rate-limiting contracts. |
| `0.2.0` | Added acknowledgement reactions and normalized slash-command events; updated to `@anvia/channel` `0.3.0`. |
| `0.1.2` | Updated to the request-object APIs in `@anvia/channel` `0.2.0`. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/telegram/CHANGELOG.md).
