# Receive Telegram events

Updates from polling or webhooks normalize into shared `ChannelEvent` values before reaching your handler. See [@anvia/telegram](/channels/telegram) for setup and receive modes.

## Start the handler

```ts
await channel.start(async (event) => {
  if (event.type === 'message') {
    console.log(event.text, event.attachments, event.replyTo, event.mentionedBot)
  }

  if (event.type === 'action') {
    console.log(event.sender.id, event.actionId, event.messageId)
  }

  if (event.type === 'command') {
    console.log(event.name, event.text)
  }

  if (event.type === 'reaction') {
    console.log(event.reaction, event.removed)
  }
})
```

- Events whose sender is any bot account are filtered out before delivery.
- `mentionedBot` is true when a message mentions the bot via `@<botusername>` (or an inline text mention), contains a command entity addressed to it with its username suffix, or replies to one of its messages. `command` events carry no `mentionedBot` field; command targeting is described below.
- The chat type maps to `conversation.kind`: `private` becomes `direct`, groups and supergroups become `group`, and channels become `channel`.
- Ordinary emoji reactions are preserved. Custom emoji become `telegram:custom_emoji:<id>` and paid reactions become `telegram:paid`; anonymous reactions use the acting chat as the normalized sender.
- Message edits arrive as `message-edited` events carrying the new text and attachments.

## Command targeting

A message whose first entity is a `bot_command` at offset 0 becomes a `command` event: the name is lowercased with any `@target` stripped, and the remaining text is trimmed into `text`. Whether the command reaches the handler depends on the chat:

- **Private chats:** a command with no target (`/ask`) or targeting this bot (`/ask@yourbot`) becomes a `command` event.
- **Groups and supergroups:** the command must target this bot (`/ask@yourbot`, matched case-insensitively). A bare `/ask` is dropped unless you construct the adapter with `allowBareGroupCommands: true`.
- **Any chat:** a command addressed to a different bot (`/ask@otherbot`) is dropped.

Dropped commands are not forwarded as ordinary messages, so they cannot start agent runs through message filters.

## Receive scope

The adapter subscribes only to `message`, `edited_message`, `message_reaction`, and `callback_query` updates. Everything else Telegram can emit — channel posts, inline queries, polls, membership changes — is never delivered. Messages with no sender, no text/caption, and no media (stickers, locations, polls on their own) also produce no event, as do button presses on messages the adapter cannot see or with non-portable callback data.

## Continue with

- [Telegram messaging](/channels/telegram/messaging) — reply, edit, and react through the Bot API.
- [Telegram client and transport](/channels/telegram/client) — validate and normalize updates yourself.
