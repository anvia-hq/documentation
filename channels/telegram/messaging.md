# Telegram messaging

Send text, topic replies, inline-keyboard buttons, files, and message lifecycle operations through the Bot API. Bot API delivery does not require the receive loop to be started. See [@anvia/telegram](/channels/telegram) for setup.

## Send messages

```ts
import { sendChannelMessage } from '@anvia/channel'

await sendChannelMessage({
  channel,
  address: { platform: 'telegram', conversationId: '-1001234567890', threadId: '42' },
  message: {
    text: 'Release candidate ready.',
    replyToMessageId: '1234',
    actions: [
      { id: 'release:approve', label: 'Approve', style: 'primary' },
      { id: 'release:deny', label: 'Deny', style: 'danger' },
    ],
  },
})
```

Numeric chat IDs may be negative, and public channel targets may use an `@username` (leading letter, at least 5 characters). Message IDs and topic IDs must be positive safe integers represented as strings in the shared channel API; the address `threadId` targets a forum topic. Text longer than 4,096 characters is split into parts when sending via `sendChannelMessage()` (which calls the adapter's `splitMessage()`); direct `channel.send()` rejects over-long text with a `RangeError` — call `channel.splitMessage()` first. The portable payload rules live in [@anvia/channel](/channels/channel).

## Actions and callback queries

Actions become a single row of inline keyboard buttons: `label` is the button text and `id` is the `callback_data`. Telegram renders every button identically, so the portable `style` hint is accepted but not visualized. The shared limits apply: at most 5 actions per message with IDs of at most 64 UTF-8 bytes.

Pressing a button delivers a `callback_query` update. The adapter answers the query automatically and emits an `action` event:

```ts
await channel.start(async (event) => {
  if (event.type === 'action') {
    console.log(event.sender.id, event.actionId, event.messageId)
  }
})
```

Callback data outside the portable limit never becomes an event. Send actions through the shared API and the constraint is already enforced, so every button you ship round-trips.

## Attachments

Incoming events expose file IDs as normalized metadata: photos arrive as the largest available size, voice messages map to the `audio` type, and documents with an image MIME type map to `image`. `channel.loadAttachment()` resolves that metadata to bytes:

```ts
const attachment = event.attachments[0]
const data = await channel.loadAttachment(event, attachment)

if (data.type === 'data') {
  const bytes = Buffer.from(data.data, 'base64')
}
```

The call invokes `getFile`, downloads through the token-bearing URL internally, caps the response at `maximumAttachmentBytes` (20 MiB by default), and returns base64 data. Authenticated URLs are never exposed to callers or models.

Outbound files may use base64 data or HTTPS URLs. URL sources are validated by the shared package, and Telegram downloads them itself; base64 sources are uploaded as multipart data. The attachment kind selects the Bot API method: `image` uses `sendPhoto`, `audio` uses `sendAudio`, `video` uses `sendVideo`, and `file` uses `sendDocument`. Several attachments use several Bot API calls and can be partially delivered when a later call fails.

## Edits, deletes, reactions, and typing

The adapter implements the full optional `Channel` surface, and `channel.capabilities` advertises `actions`, `replies`, `typing`, `reactions`, `reactionRemovals`, `delete`, `messageEdits`, and outbound `image`, `audio`, `video`, and `file` attachments:

```ts
const address = { platform: 'telegram', conversationId: '-1001234567890', threadId: '42' }

await channel.showTyping(address)
await channel.react(sent, '👍')
await channel.edit(sent, { text: 'Release candidate is live.' })
await channel.delete(sent)
```

`sent` is a `SentChannelMessage` from `channel.send()` or an element of the array returned by `sendChannelMessage()`. Editing is text-only: a message with attachments or a reply target cannot be edited, and editing a message without actions clears its inline keyboard. `react()` sets a single emoji reaction, replacing the bot's previous reaction on that message. `unreact()` takes the same arguments but ignores the emoji value — it always clears the bot's reaction. `showTyping()` sends the `typing` chat action and honors the address `threadId`.

## Continue with

- [Receive Telegram events](/channels/telegram/events) — normalized updates, reactions, and edits.
- [Telegram polling](/channels/telegram/polling) and [webhooks](/channels/telegram/webhooks) — choose a receive mode.
