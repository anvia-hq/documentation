# Discord messaging

Send text, thread replies, files, buttons, and message lifecycle operations through the Discord REST API. REST delivery does not require the Gateway connection to be started. See [@anvia/discord](/channels/discord) for setup.

## Send messages

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

`sendChannelMessage` splits text longer than 2000 characters into multiple Discord messages and returns the sent parts. If a later part fails, it throws `PartialDeliveryError`, whose `sent` field lists the parts already delivered. Actions become one row of message buttons, with at most 5 actions per message and action IDs of at most 64 bytes: `style` maps `'primary'` and `'danger'` to the matching Discord button color and anything else (including an omitted style) to secondary grey. The action `id` becomes the button `custom_id` and is delivered back as the `actionId` of an action event.

Generated text is sent with Discord mentions disabled (`allowed_mentions` parses nothing), preventing unexpected `@everyone`, role, or user notifications.

## Command replies

A slash command is acknowledged with a deferred reply. While its handler runs, the first send to the command's channel is attempted as an edit of that deferred reply through the interaction webhook:

- Sends inside one command handler are serialized, so a second send waits for the first reply attempt to settle and then posts as a normal channel message.
- If the reply edit fails (the interaction token expired, the placeholder was deleted, or Discord returned an error), the failure is reported through `onError` and the message is posted to the channel instead.
- When the handler finishes without answering, or the answer fell back to a channel post, the deferred reply is deleted.
- A send made through the command's reply context after its handler has finished is rejected with an error rather than reusing a stale interaction.

Sends to other channels during a command handler are ordinary channel posts.

## Threads and replies

Incoming thread messages use the parent channel as `conversation.id` and the Discord thread as `conversation.threadId`. `channel.send()` targets `threadId` when present, so preserving the conversation fields replies inside the same thread:

```ts
if (event.type !== 'message') return

await channel.send(
  {
    platform: event.platform,
    conversationId: event.conversation.id,
    threadId: event.conversation.threadId,
    // accountId: event.accountId, // preserve for multi-bot setups
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

`edit()` rejects messages carrying `replyToMessageId` because Discord reply targets cannot be edited. An edit replaces the message's attachments with the ones in the edited message, so an edit without attachments removes any existing files. `react()` accepts any non-empty emoji string and uses the "own reaction" REST endpoint. `unreact()` removes the bot's own reaction through the matching removal endpoint.

The adapter capabilities reflect this: `actions`, `replies`, `typing`, `reactions`, `reactionRemovals`, `delete`, and `messageEdits` are all enabled, with outbound attachments of every kind.

## Continue with

- [Receive Discord events](/channels/discord/receiving) — Gateway input and normalization.
- [Custom Discord gateway](/channels/discord/gateway) — own the connection and shut down cleanly.
