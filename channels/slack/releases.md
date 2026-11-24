# Releases

The current release of `@anvia/slack` on npm is **0.4.2**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.4.2` | Records Socket Mode deduplication keys only after a message is fully handled, and validates command payloads at runtime. Updated `@anvia/channel` to `0.5.0`. |
| `0.4.1` | Deduplicates `message` and `app_mention` callbacks to prevent double replies, and keeps every split part in the reply thread. |
| `0.4.0` | Publishes attachments with their text or actions as one file message. Custom `SlackWebClient` implementations must replace `uploadFile` with `postFileMessage` and `deleteFile`. Requires HTTPS for file download URLs. |
| `0.3.0` | Added reaction removal and the shared command, acknowledgement-cleanup, and rate-limiting integration; updated to `@anvia/channel` `0.4.0`. |
| `0.2.0` | Added acknowledgement reactions and normalized slash-command events; updated to `@anvia/channel` `0.3.0`. |
| `0.1.2` | Updated to the request-object APIs in `@anvia/channel` `0.2.0`. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/slack/CHANGELOG.md).
