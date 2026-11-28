# Releases

The current release of `@anvia/slack` on npm is **0.4.2**. Channels packages require Node.js 24 or later.

| Version | Summary |
| --- | --- |
| `0.4.2` | Records Socket Mode deduplication keys only after the transport handler resolves, so a transport-level handler failure leaves the event eligible for redelivery or the paired `app_mention`/`message` envelope. `slack()` catches and reports application handler errors, so those events are still marked handled. Also upgraded to `@anvia/core` 1.21.0, validates command payloads at runtime, and avoids base64 round-trips for outbound URL attachments. Updated `@anvia/channel` to `0.5.0`. |
| `0.4.1` | Deduplicates `message` and `app_mention` callbacks to prevent double replies, and keeps every split part in the reply thread. |
| `0.4.0` | Publishes attachments with their text or actions as one file message and cleans up uploads on failure. Sent-message IDs for file messages become opaque `timestamp:fileId` handles. Custom `SlackWebClient` implementations must replace `uploadFile` with `postFileMessage` and `deleteFile`. Outbound file messages require `files:read` as well as `files:write`. Requires HTTPS for file download URLs. |
| `0.3.0` | Added reaction removal and the shared command, acknowledgement-cleanup, and rate-limiting integration; updated to `@anvia/channel` `0.4.0`. |
| `0.2.0` | Added acknowledgement reactions and normalized slash-command events; updated to `@anvia/channel` `0.3.0`. |
| `0.1.2` | Updated to the request-object APIs in `@anvia/channel` `0.2.0`. |

Read the complete [source changelog](https://github.com/anvia-hq/channels/blob/main/packages/slack/CHANGELOG.md).
