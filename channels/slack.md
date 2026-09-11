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
| Parse raw Socket Mode payloads                  | `parseSlackSocketEvent()`, `parseSlackSocketInteraction()`, `parseSlackSocketCommand()` |
| Normalize validated Slack values                | `normalizeSlackEvent()`                                    |
| Normalize messages, actions, or commands        | `normalizeSlackMessage()`, `normalizeSlackAction()`, `normalizeSlackCommand()` |
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

## Continue with

- [Slack messaging](/channels/slack/messaging) — send, threads, attachments, edits, and reactions.
- [Receive Slack events](/channels/slack/receiving) — Socket Mode input and normalization.
- [Custom Slack transport](/channels/slack/transport) — own the transport and shut down cleanly.
