# @anvia/discord

`@anvia/discord` provides a production-oriented [channel](/channels/channel) adapter backed by the Discord Gateway for inbound events and the Discord REST API for outbound messages.

Start with `discord()` unless you are replacing its transport.

## Which utility should I use?

| Task                                                 | Utility                                                 |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Normal application or agent                          | `discord()`                                             |
| Dependency-inject a custom gateway                   | `new DiscordChannel({ gateway })`                       |
| Use the built-in raw `discord.js` transport directly | `DiscordJsGateway`                                      |
| Implement a replacement transport                    | `DiscordGateway` interface                              |
| Normalize a validated gateway value                  | `normalizeDiscordEvent()`                               |
| Normalize only messages or actions                   | `normalizeDiscordMessage()`, `normalizeDiscordAction()` |
| Validate Discord IDs in application configuration    | `isDiscordSnowflake()`, `validateDiscordSnowflake()`    |

The low-level exports are extension points. A normal bot should not call a normalizer manually or construct `DiscordJsGateway` itself.

## Configure the Discord application

1. Create an application and bot in the [Discord Developer Portal](https://discord.com/developers/applications).
2. Enable **Message Content Intent** when the bot must read ordinary guild messages. The adapter requests that privileged intent by default.
3. Install the bot with `VIEW_CHANNEL`, `SEND_MESSAGES`, and `READ_MESSAGE_HISTORY`.
4. Add `SEND_MESSAGES_IN_THREADS` for thread replies, `ATTACH_FILES` for outbound files, and `ADD_REACTIONS` when using `channel.react()`.
5. Grant access only to the servers and channels the application should process.

Set `messageContentIntent: false` for a mention-only guild bot that does not have privileged intent approval. Discord still supplies message content in direct messages, messages sent by the bot, and messages that mention the bot. See Discord's [Gateway intent documentation](https://docs.discord.com/developers/events/gateway) and [permission reference](https://docs.discord.com/developers/topics/permissions) for application setup details.

## Create the adapter

```ts
import { discord } from '@anvia/discord'

const channel = discord({
  token: process.env.DISCORD_BOT_TOKEN!,
  messageContentIntent: true,
  maximumAttachmentBytes: 25 * 1024 * 1024,
  onError(error, context) {
    console.error('discord', context.operation, error)
  },
})
```

`messageContentIntent` defaults to `true` and `maximumAttachmentBytes` defaults to 25 MiB. The byte limit caps each outbound file and the combined bytes buffered for one message. URL-backed outbound files are downloaded sequentially with redirects rejected; pass a custom `fetch` that allowlists trusted hosts when attachment URLs are not controlled by your application.

`onError` receives the error and a context object whose `operation` is `'gateway'` for connection problems or `'handle'` when an event handler threw; the failing gateway event is attached in the latter case. Observer failures never terminate delivery.

## Send messages

REST delivery does not require the Gateway connection to be started:

```ts
import { sendChannelMessage } from '@anvia/channel'

await sendChannelMessage({
  channel,
  address: {
    platform: 'discord',
    conversationId: process.env.DISCORD_CHANNEL_ID!,
  },
  message: {
    text: 'Deployment finished.',
    actions: [{ id: 'deploy:details', label: 'Details', style: 'primary' }],
  },
})
```

`sendChannelMessage` splits text longer than 2000 characters into multiple Discord messages and returns the sent parts. Actions become message buttons: `style` maps `'primary'` and `'danger'` to the matching Discord button color, and the action `id` is delivered back as the `actionId` of an action event.

Generated text is sent with Discord mentions disabled (`allowed_mentions` parses nothing), preventing unexpected `@everyone`, role, or user notifications.

## Receive events

```ts
await channel.start(async (event) => {
  switch (event.type) {
    case 'message':
      console.log(event.text, event.attachments, event.replyTo)
      break
    case 'action':
      console.log(event.actionId)
      break
    case 'message-edited':
    case 'message-deleted':
    case 'reaction':
      console.log(event.type, event.messageId)
      break
  }
})
```

Bot-authored events are filtered before the handler runs. System messages and messages without content or attachments are dropped during normalization. Gateway reaction events from uncached messages are fetched before delivery. Handler failures are reported through `onError` without terminating the Gateway.

Gateway health surfaces through `onError`: shard disconnects, reconnect attempts, and invalidated sessions (for example a revoked token) are all reported while `discord.js` keeps the connection alive. Events emitted during an outage gap are lost.

Actions arrive as button interactions. The gateway acknowledges each interaction with `deferUpdate` before the handler runs, so the button stops showing "thinking" immediately; use `channel.edit()` to update the message afterwards.

## Threads and replies

Incoming thread messages use the parent channel as `conversation.id` and the Discord thread as `conversation.threadId`. `channel.send()` targets `threadId` when present, so preserving the conversation fields replies inside the same thread:

```ts
if (event.type !== 'message') return

await channel.send(
  {
    platform: event.platform,
    conversationId: event.conversation.id,
    threadId: event.conversation.threadId,
  },
  { text: 'Replying inside the same thread.', replyToMessageId: event.raw.id },
)
```

Discord message IDs and channel IDs must be valid snowflakes and are validated before any API call.

## Attachments

Incoming attachment metadata is normalized during delivery, including media type inference from the filename. `channel.loadAttachment()` returns only the Discord HTTPS CDN URL; it does not download inbound bytes into the application. The [channel agent](/channels/channel-agent) consumes that URL when building a multimodal prompt.

Outbound attachments accept HTTPS URLs or base64 data. Each file and the message total are capped by `maximumAttachmentBytes`. A message must include text or attachments, and text is capped at 2000 characters.

## Typing, edits, deletes, and reactions

All are direct channel methods backed by the Discord REST API:

```ts
const [sent] = await sendChannelMessage({ channel, address, message })

await channel.showTyping(address) // Trigger the typing indicator.
await channel.edit(sent, { text: 'Deployment finished successfully.' })
await channel.react(sent, '👍')
await channel.delete(sent)
```

`edit()` rejects messages carrying `replyToMessageId` because Discord reply targets cannot be edited. `react()` accepts any non-empty emoji string and uses the "own reaction" REST endpoint. `unreact()` removes the bot's own reaction through the matching removal endpoint.

Command responses land in place: a deferred chat-input command interaction stays open and the next send to that channel edits the deferred reply through the interaction webhook instead of posting a separate dangling message.

The adapter capabilities reflect this: `actions`, `replies`, `typing`, `reactions`, `reactionRemovals`, `delete`, and `messageEdits` are all enabled, with outbound attachments of every kind.

## Agent integration

```ts
import { createChannelAgent } from '@anvia/channel-agent'

const service = createChannelAgent({ channel, agent })
await service.start()
```

The default filter handles direct messages plus guild messages that mention or reply to the bot. Use `service.stop()`, not `channel.stop()`, when the service started the adapter.

## Custom gateway

Use the `DiscordGateway` interface when an existing application already owns a Discord connection:

```ts
import { DiscordChannel } from '@anvia/discord'
import type { DiscordGateway } from '@anvia/discord'

const gateway: DiscordGateway = existingGatewayAdapter
const channel = new DiscordChannel({ gateway })
```

The custom gateway must emit runtime-validated `DiscordGatewayEvent` values, implement the REST operations required by the interface (`send`, `edit`, `delete`, `showTyping`, `react`), and drain in-flight handlers during `stop()`. `DiscordJsGateway` is a reference implementation.

## Shutdown

```ts
await channel.stop()
```

Stopping detaches Gateway listeners, destroys the Discord client, and waits for current event deliveries. It is safe to call after a direct `channel.start()`; if a [channel agent](/channels/channel-agent) owns the adapter, stop the service instead.
