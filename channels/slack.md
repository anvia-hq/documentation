# @anvia/slack

`@anvia/slack` combines Socket Mode for inbound events with Slack Web API calls for outbound messages in a production-oriented [channel](/channels/channel) adapter.

Start with `slack()` unless the host application already owns a Slack transport.

## Which utility should I use?

| Task                                            | Utility                                                    |
| ----------------------------------------------- | ---------------------------------------------------------- |
| Normal Socket Mode application or agent         | `slack()`                                                  |
| Inject an existing transport                    | `new SlackChannel({ transport })`                          |
| Use the built-in Socket Mode transport directly | `SlackSocketTransport`                                     |
| Implement a replacement transport               | `SlackTransport` interface                                 |
| Parse raw Socket Mode payloads                  | `parseSlackSocketEvent()`, `parseSlackSocketInteraction()` |
| Normalize validated Slack values                | `normalizeSlackEvent()`                                    |
| Normalize only messages or actions              | `normalizeSlackMessage()`, `normalizeSlackAction()`        |
| Validate Slack IDs or message timestamps        | `isSlackId()`, `isSlackTimestamp()`, `validateSlackId()`, `validateSlackTimestamp()` |

Normal applications need only `slack()` and `sendChannelMessage()`. The parsing helpers are for custom transports and tests.

## Configure the Slack app

1. Create a Slack app and enable **Socket Mode**.
2. Create an app-level token with `connections:write`; pass it as `appToken`.
3. Install the app with a bot token containing `chat:write`.
4. Add `app_mentions:read` plus the history scopes matching received conversations. A minimal direct-message setup uses `im:history`; broader subscriptions use `channels:history`, `groups:history`, or `mpim:history` as applicable.
5. Add `files:read` for incoming attachment downloads, `files:write` for outbound attachments, and `reactions:write` for `channel.react()`. To receive reaction lifecycle events, also add `reactions:read` and subscribe to `reaction_added` and `reaction_removed`.
6. Subscribe to `app_mention` and `message.im` for mention-driven channels and direct messages.
7. Enable **Interactivity & Shortcuts** for portable action buttons.
8. Reinstall the app after changing scopes or subscriptions, and invite it to channels where it should receive mentions.

Request only the scopes the application uses. `chat:write.public` is needed only when the app must proactively post to public channels it has not joined. See Slack's [OAuth scope catalog](https://api.slack.com/scopes) and [Events API guide](https://api.slack.com/apis/connections/events-api) when selecting additional features.

## Create the adapter

```ts
import { slack } from '@anvia/slack'

const channel = slack({
  appToken: process.env.SLACK_APP_TOKEN!,
  botToken: process.env.SLACK_BOT_TOKEN!,
  maximumAttachmentBytes: 20 * 1024 * 1024,
  onError(error, context) {
    console.error('slack', context.operation, error)
  },
})
```

The app token should begin with `xapp-`; the installed bot token should begin with `xoxb-`. Never log either token. `maximumAttachmentBytes` defaults to 20 MiB and caps outbound attachment downloads as well as inbound attachment fetches.

`onError` receives the error and a context object whose `operation` is `'socket'` for connection problems or `'handle'` when an event handler threw; the failing socket event is attached in the latter case. Socket Mode reconnects and disconnects are reported through the same callback. Observer failures never terminate delivery.

## Send messages

Outbound Web API calls do not require Socket Mode to be started:

```ts
import { sendChannelMessage } from '@anvia/channel'

await sendChannelMessage({
  channel,
  address: { platform: 'slack', conversationId: process.env.SLACK_CHANNEL_ID! },
  message: {
    text: 'The import needs review.',
    attachments: [
      {
        type: 'file',
        mediaType: 'text/csv',
        filename: 'invalid-rows.csv',
        source: { type: 'data', data: csvBuffer.toString('base64') },
      },
    ],
  },
})
```

Text is posted first with `chat.postMessage` (link previews disabled), then files are uploaded sequentially with `files.uploadV2`. A multi-file delivery may be partially visible if a later upload fails; use idempotent application retries. `sendChannelMessage` splits text longer than 4000 characters into multiple messages and returns the sent parts.

Actions become Slack `actions` blocks with one button per action; the action `id` is returned as the `actionId` of an action event, and `style: 'primary' | 'danger'` maps to the matching Slack button color.

Model-generated text is protected against unintended notifications: token mentions such as `<@U123>`, `<!channel>`, and `<#channel>` are HTML-escaped in outbound text, and `link_names` is disabled on every post.

## Receive events

```ts
await channel.start(async (event) => {
  if (event.type === 'message') {
    console.log(event.text, event.attachments, event.conversation.threadId)
  }
  if (event.type === 'action') {
    console.log(event.actionId)
  }
})
```

Socket envelopes are acknowledged before handler execution, so Slack does not re-deliver while the handler runs. Duplicate deliveries are suppressed with a bounded in-memory set of event IDs, and bot-authored events are filtered before the application handler runs. Handler failures are reported through `onError` without disconnecting.

On start, the adapter calls `auth.test` to resolve the team and bot user identity before accepting events. Direct messages and app-home conversations normalize with conversation kind `'direct'`, multi-party direct messages with `'group'`, and channels with `'channel'`. A message is flagged `mentionedBot` for `app_mention` events or when its text contains the bot user mention.

## Threads and replies

Slack thread timestamps map directly to `ChannelAddress.threadId`. `replyToMessageId` takes precedence when explicitly provided; otherwise sends target the address thread:

```ts
if (event.type !== 'message') return

await channel.send(
  {
    platform: 'slack',
    conversationId: event.conversation.id,
    threadId: event.conversation.threadId,
  },
  { text: 'Following up in this thread.' },
)
```

Message IDs and thread IDs are Slack timestamps such as `1712345678.123456`, not arbitrary UUIDs, and are validated before any API call. A thread reply arriving without its own mention sets `replyTo` on the message event.

## Attachments

Incoming file URLs are token-bearing and private, so they are retained only inside the validated raw event. `channel.loadAttachment()` performs an authenticated, size-capped download with the bot token and returns base64 data; the token-bearing URL never reaches the agent prompt. Download URLs are restricted to Slack-controlled HTTPS domains.

Outbound attachments accept HTTPS URLs or base64 data. Each file is downloaded or decoded, size-checked against `maximumAttachmentBytes`, and uploaded with `files.uploadV2` (into the thread when the target is threaded). A files-only message uses a zero-width-space text fallback because Slack requires one.

## Edits, deletes, and reactions

```ts
const [sent] = await sendChannelMessage({ channel, address, message })

await channel.edit(sent, { text: 'The import is under review.' })
await channel.react(sent, 'eyes')
await channel.delete(sent)
```

`edit()` accepts text-only changes; attachments and reply targets cannot be edited and throw a `TypeError`. `react()` strips surrounding colons from the emoji name before calling `reactions.add`. `unreact()` removes the bot's own reaction through `reactions.remove`.

## Capability notes

The adapter reports `actions`, `replies`, `reactions`, `reactionRemovals`, `delete`, and `messageEdits`, with outbound attachments of every kind. `capabilities.typing` is absent: Slack has no general bot typing-indicator API, so there is no `showTyping`. Use the [channel agent](/channels/channel-agent) placeholder message when users need progress feedback.

## Agent integration

```ts
import { createChannelAgent } from '@anvia/channel-agent'

const service = createChannelAgent({
  channel,
  agent,
  streaming: { placeholder: 'Thinking…' },
})
await service.start()
```

The default filter responds to direct conversations and to channel messages that mention the bot (`app_mention` events or inline `<@bot>` text). Broader Slack event subscriptions do not automatically broaden this filter; customize `shouldHandle` when other messages must reach the agent. Use `service.stop()`, not `channel.stop()`, when the service started the adapter.

## Custom transport

Inject a `SlackTransport` when another layer owns Socket Mode or when tests need a fake transport:

```ts
import { SlackChannel } from '@anvia/slack'

const channel = new SlackChannel({ transport: existingSlackTransport })
```

The transport must parse and validate external payloads into `SlackSocketEvent` values (use `parseSlackSocketEvent()` and `parseSlackSocketInteraction()`), acknowledge Slack envelopes promptly, implement the Web API operations (`send`, `edit`, `delete`, `react`, `loadAttachment`), and drain active handlers during shutdown. `SlackSocketTransport` is a reference implementation.

## Shutdown

```ts
await channel.stop()
```

Stopping detaches listeners, disconnects Socket Mode, and waits for in-flight deliveries. Stop the [channel agent](/channels/channel-agent) service instead when it owns the channel.
