# Receive Telegram events

Updates from polling or webhooks normalize into shared `ChannelEvent` values before reaching your handler. See [@anvia/telegram](/channels/telegram) for setup and receive modes.

## Start the handler

```ts
await channel.start(async (event) => {
  if (event.type === 'message') {
    console.log(event.text, event.attachments, event.replyTo, event.mentionedBot)
  }

  if (event.type === 'reaction') {
    console.log(event.reaction, event.removed)
  }
})
```

- Updates authored by the bot itself are filtered out before delivery.
- `mentionedBot` is true when a message mentions the bot by username or inline text mention, addresses a command to it, or replies to one of its messages.
- The chat type maps to `conversation.kind`: `private` becomes `direct`, groups and supergroups become `group`, and channels become `channel`.
- Ordinary emoji reactions are preserved. Custom emoji become `telegram:custom_emoji:<id>` and paid reactions become `telegram:paid`; anonymous reactions use the acting chat as the normalized sender.
- Message edits arrive as `message-edited` events carrying the new text and attachments.

## Continue with

- [Telegram messaging](/channels/telegram/messaging) — reply, edit, and react through the Bot API.
- [Telegram client and transport](/channels/telegram/client) — validate and normalize updates yourself.
