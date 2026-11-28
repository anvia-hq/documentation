# Custom Slack transport

Inject a `SlackTransport` when another layer owns Socket Mode or when tests need a fake transport. See [@anvia/slack](/channels/slack) for standard setup.

## Inject a transport

```ts
import { SlackChannel } from '@anvia/slack'

const channel = new SlackChannel({ transport: existingSlackTransport })
```

The transport must parse and validate external payloads into `SlackSocketEvent` values (use `parseSlackSocketEvent()`, `parseSlackSocketInteraction()`, and `parseSlackSocketCommand()` — without the last, slash commands are silently dropped), acknowledge Slack envelopes promptly, implement the `start`/`stop` lifecycle plus the Web API operations (`send`, `edit`, `delete`, `react`, `removeReaction`, `loadAttachment`), and drain active handlers during shutdown. `delete` receives the file IDs from a file-message handle as an optional third argument. `SlackSocketTransport` is a reference implementation.

## Replace the Web API client

`SlackSocketTransport` accepts a custom `SlackWebClient` as its second constructor argument, for tests or a host-owned Web API client:

```ts
import { SlackChannel, SlackSocketTransport } from '@anvia/slack'

const transport = new SlackSocketTransport(
  { appToken: process.env.SLACK_APP_TOKEN!, botToken: process.env.SLACK_BOT_TOKEN! },
  webClient,
)
const channel = new SlackChannel({ transport })
```

`webClient` is an application-owned object implementing every `SlackWebClient` method:

- `authenticate()` resolves the `auth.test` response (`team_id` and `user_id`).
- `postMessage(channelId, threadTimestamp, message)` and `updateMessage(channelId, timestamp, message)` post and edit text messages.
- `deleteMessage(channelId, timestamp)`, `addReaction(channelId, timestamp, reaction)`, and `removeReaction(channelId, timestamp, reaction)`.
- `postFileMessage(channelId, threadTimestamp, message, maximumBytes)` publishes attachments and text as one message and resolves to a `SlackSentMessage` with its `fileIds`.
- `deleteFile(fileId)` removes an uploaded file.
- `downloadFile(url, maximumBytes, signal?)` performs the authenticated, size-capped download behind `loadAttachment()`.

Since 0.4.0 a custom client must implement `postFileMessage` and `deleteFile`; the former `uploadFile` method is gone.

## Shutdown

```ts
await channel.stop()
```

Stopping detaches listeners, disconnects Socket Mode, and waits for in-flight deliveries. Stop the [channel agent](/channels/channel-agent) service instead when it owns the channel.

## Continue with

- [Receive Slack events](/channels/slack/receiving) — what the transport delivers.
- [Slack messaging](/channels/slack/messaging) — the Web API operations a custom transport must implement.
