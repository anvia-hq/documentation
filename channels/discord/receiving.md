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

Bot-authored events are filtered before the handler runs. System messages and messages without content or attachments are dropped during normalization. Gateway reaction events from uncached messages are fetched before delivery. Handler failures are reported through `onError` without terminating the Gateway.

Gateway health surfaces through `onError`: shard disconnects, reconnect attempts, and invalidated sessions (for example a revoked token) are all reported while `discord.js` keeps the connection alive. Events emitted during an outage gap are lost; sessions are not resumed from before the outage.

Actions arrive as button interactions. The gateway acknowledges each interaction with `deferUpdate` before the handler runs, so the button stops showing "thinking" immediately; use `channel.edit()` to update the message afterwards.

## Continue with

- [Discord messaging](/channels/discord/messaging) — reply, edit, and react through REST.
- [Custom Discord gateway](/channels/discord/gateway) — replace the transport and shut down cleanly.
