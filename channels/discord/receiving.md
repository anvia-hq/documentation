# Receive Discord events

Inbound events arrive through the Discord Gateway and are normalized into shared `ChannelEvent` values before reaching your handler. See [@anvia/discord](/channels/discord) for setup.

## Start the handler

```ts
await channel.start(async (event) => {
  switch (event.type) {
    case 'message':
      console.log(event.text, event.attachments, event.replyTo)
      break
    case 'action':
      console.log(event.actionId)
      break
    case 'command':
      console.log(event.name, event.text)
      break
    case 'message-edited':
    case 'message-deleted':
    case 'reaction':
      console.log(event.type, event.messageId)
      break
  }
})
```

Events whose `sender` is a bot are filtered before the handler runs. `message-deleted` events carry no sender, so deletions of bot-authored messages, including the bot's own, still reach the handler. Messages and edits whose attachments are not HTTPS URLs on `cdn.discordapp.com` or `media.discordapp.net` fail validation and are dropped as a whole. System messages and messages without content or attachments are dropped during normalization. Gateway reaction events from uncached messages are fetched before delivery. Handler failures are reported through `onError` without terminating the Gateway.

Gateway health surfaces through `onError`: shard disconnects, reconnect attempts, and invalidated sessions (for example a revoked token) are all reported while `discord.js` keeps the connection alive. The adapter does not replay missed events, so do not rely on receiving events emitted while the connection was down.

The gateway acknowledges every interaction before or instead of running the handler:

- **Buttons** arrive as `action` events. The gateway acknowledges them with `deferUpdate` before the handler runs, so the button stops showing "thinking" immediately; use `channel.edit()` to update the message afterwards.
- **Slash commands** arrive as `command` events. The gateway acknowledges them with `deferReply`, which shows a "thinking" reply that the next send can replace (see [Discord messaging](/channels/discord/messaging#command-replies)).
- **Autocomplete** interactions are answered with an empty result list and reported through `onError`.
- **Unsupported types** (context menus, select menus, modal submits) and interactions whose payload cannot be read get an ephemeral "This bot cannot handle this interaction." reply and an `onError` report.

If `deferReply` or `deferUpdate` itself fails, the failure is reported through `onError` and the handler does not run for that interaction.

## Continue with

- [Discord messaging](/channels/discord/messaging) — reply, edit, and react through REST.
- [Custom Discord gateway](/channels/discord/gateway) — replace the transport and shut down cleanly.
