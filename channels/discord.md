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
| Normalize messages, actions, or commands      | `normalizeDiscordMessage()`, `normalizeDiscordAction()`, `normalizeDiscordCommand()` |
| Render command options as text               | `discordCommandOptionText()`                  |
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

## Agent integration

```ts
import { createChannelAgent } from '@anvia/channel-agent'

const service = createChannelAgent({ channel, agent })
await service.start()
```

The channel-agent default filter handles direct messages plus guild messages that mention or reply to the bot (see [Channel agent](/channels/channel-agent)). Use `service.stop()`, not `channel.stop()`, when the service started the adapter.

## Continue with

- [Discord messaging](/channels/discord/messaging) — send, threads, attachments, edits, and reactions.
- [Receive Discord events](/channels/discord/receiving) — Gateway input and normalization.
- [Custom Discord gateway](/channels/discord/gateway) — own the connection and shut down cleanly.
