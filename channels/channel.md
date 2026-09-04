# @anvia/channel

`@anvia/channel` is the platform-neutral foundation for channels: it defines addresses, normalized events, portable messages, splitting, runtime validation, and the `Channel` interface every adapter implements, with no dependency on `@anvia/core` or a platform SDK.

The package is currently a private workspace package in the channels monorepo; `@anvia/channel` is its intended npm name.

## Pick the right utility

| Task                                   | Utility                                  |
| -------------------------------------- | ---------------------------------------- |
| Describe a destination                 | `ChannelAddress`                         |
| Describe portable output               | `ChannelMessage`                         |
| Receive normalized platform input      | `ChannelEvent` and `ChannelEventHandler` |
| Send potentially long output           | `sendChannelMessage()`                   |
| Send one already-bounded message       | `channel.send()`                         |
| Split a complete portable message      | `splitChannelMessage()`                  |
| Split raw text only                    | `splitChannelText()`                     |
| Validate a whole portable payload      | `validateChannelMessage()`               |
| Validate portable buttons              | `validateChannelActions()`               |
| Validate portable outbound files       | `validateChannelAttachments()`           |
| Check whether an action ID is portable | `isChannelActionId()`                    |
| Implement a new adapter                | `Channel<RawEvent>`                      |

For a normal Discord, Slack, or Telegram application, create the channel with the platform factory ([Discord](/channels/discord), [Slack](/channels/slack), [Telegram](/channels/telegram)) and use only the shared types plus `sendChannelMessage()` from this package.

## Addresses

A `ChannelAddress` identifies where output should go:

```ts
import type { ChannelAddress } from '@anvia/channel'

const address: ChannelAddress = {
  platform: 'discord',
  accountId: '123456789012345678',
  conversationId: '234567890123456789',
  threadId: '345678901234567890',
}
```

- `platform` must match the adapter.
- `accountId` distinguishes two bot/application accounts on the same platform and is optional.
- `conversationId` is the channel, chat, or direct-message conversation.
- `threadId` is the platform thread/topic identifier when present.

When replying to an incoming event, copy these fields from `event.platform`, `event.accountId`, and `event.conversation` instead of reconstructing platform IDs.

## Send a portable message

Use `sendChannelMessage()` at application boundaries when a worker or webhook pushes output without a matching inbound event. It takes one options object, validates the payload, asks the adapter to split it, and sends the parts sequentially:

```ts
import { sendChannelMessage } from '@anvia/channel'

const messages = await sendChannelMessage({
  channel,
  address,
  message: {
    text: report,
    replyToMessageId: sourceMessageId,
    actions: [
      { id: 'report:acknowledge', label: 'Acknowledge', style: 'primary' },
      { id: 'report:dismiss', label: 'Dismiss', style: 'danger' },
    ],
    attachments: [
      {
        type: 'file',
        mediaType: 'text/csv',
        filename: 'report.csv',
        source: { type: 'data', data: csvBuffer.toString('base64') },
      },
    ],
  },
})
```

`channel.send()` is the lower-level operation: it delivers one already-bounded message with no splitting. Application code normally goes through `sendChannelMessage()`; only call `send()` directly when you know the message fits the platform.

Reply metadata lands on every part; actions and attachments ride on the final part. A media-only message uses `text: ''` and at least one attachment.

If a later part fails to send, `sendChannelMessage()` throws `PartialDeliveryError` carrying the `sent` prefix, the `failedPart`, and its zero-based `failedIndex`, so callers can resume without resending delivered parts.

URL-backed attachments carry a reference instead of bytes:

```ts
const message = {
  text: 'Dashboard snapshot',
  attachments: [
    {
      type: 'image' as const,
      mediaType: 'image/png',
      filename: 'dashboard.png',
      source: { type: 'url' as const, url: 'https://cdn.example.com/dashboard.png' },
    },
  ],
}
```

Slack and Discord download URL-backed files in the application process. Pass a restricted `fetch` implementation to those adapters when a URL can be selected by a user or model: enforce an origin allowlist and block private-network destinations.

## Handle events

`ChannelEvent` is a discriminated union. Narrow `event.type` before reading event-specific fields:

```ts
import type { ChannelEvent } from '@anvia/channel'

function inspect(event: ChannelEvent): void {
  switch (event.type) {
    case 'message':
      console.log(event.text, event.attachments, event.replyTo)
      break
    case 'action':
      console.log(event.messageId, event.actionId)
      break
    case 'message-edited':
      console.log(event.messageId, event.text)
      break
    case 'message-deleted':
      console.log(event.messageId)
      break
    case 'reaction':
      console.log(event.messageId, event.reaction, event.removed)
      break
  }
}
```

Every variant shares `id`, `platform`, `accountId`, `conversation`, and `sender` where applicable; the original validated platform value stays available as `event.raw`. Platform adapters runtime-validate external payloads before producing these events. On `message` events, `mentionedBot` tells you whether the bot was mentioned directly.

## Splitting and platform limits

Each adapter owns its platform's text limit through `splitMessage()`. The package exports the two helpers adapters build on: `splitChannelText()` splits plain text, and `splitChannelMessage()` splits a complete portable message:

```ts
import { splitChannelMessage, splitChannelText } from '@anvia/channel'

const textParts = splitChannelText({ text: longReport, maximumLength: 2_000 })
const parts = splitChannelMessage({ message, maximumLength: 2_000 })
```

Splitting behavior:

- Boundaries prefer readability: the last newline before the limit, then the last space, then a hard cut.
- A split never divides a surrogate pair; a `maximumLength` too small to hold one Unicode character throws a `RangeError`.
- Empty text throws a `TypeError`; a media-only message (`text: ''` plus attachments) becomes a single part.
- `replyToMessageId` is copied to every part.
- `actions` and `attachments` are placed only on the final part.

## Runtime validation

`sendChannelMessage()` validates actions and attachments up front, and every platform `send()` validates again before delivery. Call the validators yourself when you build UI constraints or accept user-supplied payloads:

```ts
import {
  validateChannelActions,
  validateChannelAttachments,
  validateChannelMessage,
} from '@anvia/channel'

validateChannelMessage(message) // checks actions and attachments
validateChannelActions(message.actions)
validateChannelAttachments(message.attachments)
```

The validators throw a `TypeError` for malformed values and a `RangeError` for limit violations. The portable limits:

- At most 5 actions per message (`MAX_CHANNEL_ACTIONS`).
- Action labels contain between 1 and 80 characters (`MAX_CHANNEL_ACTION_LABEL_LENGTH`).
- Action IDs are non-empty, unique within a message, and at most 64 UTF-8 bytes (`MAX_CHANNEL_ACTION_ID_BYTES`; `isChannelActionId()` checks this).
- At most 10 outbound attachments per logical message (`MAX_CHANNEL_ATTACHMENTS`).
- Attachment `url` sources must use HTTPS; `data` sources must be valid base64.
- When present, `actions` and `attachments` must be non-empty arrays.

Use the exported `MAX_CHANNEL_*` constants when an application UI needs to enforce the same limits.

## Advertise capabilities

`channel.capabilities` is optional; generic code should inspect it before presenting a feature or calling an optional operation:

```ts
if (channel.capabilities?.typing === true) {
  await channel.showTyping?.(address)
}

if (channel.capabilities?.reactions === true && channel.react !== undefined) {
  await channel.react(sentMessage, '👍')
}

if (channel.capabilities?.delete === true && channel.delete !== undefined) {
  await channel.delete(sentMessage)
}

if (channel.capabilities?.messageEdits === true && channel.edit !== undefined) {
  await channel.edit(sentMessage, { text: 'Dashboard snapshot (updated)' })
}
```

`capabilities.actions` is the only required flag; `outboundAttachments` lists accepted attachment kinds, and `replies`, `typing`, `reactions`, `delete`, and `messageEdits` gate the optional operations. The standard adapters advertise their exact support; a custom text-only adapter may omit `capabilities` entirely.

## Build a custom adapter

Implement `Channel<RawEvent>` and keep every platform SDK type inside the adapter package. Five members are required:

- `platform` names the adapter and must match `ChannelAddress.platform`.
- `splitMessage(message)` bounds output for the platform.
- `start(handler)` connects and begins delivering normalized events through `handler`.
- `stop()` detaches listeners and drains in-flight deliveries.
- `send(address, message)` delivers one already-bounded message.

`capabilities`, `loadAttachment(event, attachment, signal?)`, `edit(sent, message)`, `delete(sent)`, `showTyping(address)`, and `react(sent, reaction)` are optional.

```ts
import { splitChannelMessage } from '@anvia/channel'
import type {
  Channel,
  ChannelAddress,
  ChannelEventHandler,
  ChannelMessage,
  SentChannelMessage,
} from '@anvia/channel'

type AcmeEvent = Readonly<{ id: string; body: unknown }>

export class AcmeChannel implements Channel<AcmeEvent> {
  readonly platform = 'acme'
  readonly capabilities = { actions: false } as const

  splitMessage(message: ChannelMessage): readonly ChannelMessage[] {
    return splitChannelMessage({ message, maximumLength: 2_000 })
  }

  async start(handler: ChannelEventHandler<AcmeEvent>): Promise<void> {
    // Connect the Acme SDK, validate its payloads, normalize them, then await handler(event).
  }

  async stop(): Promise<void> {
    // Detach listeners, close the SDK client, and drain in-flight deliveries.
  }

  async send(address: ChannelAddress, message: ChannelMessage): Promise<SentChannelMessage> {
    // Validate the address and message before calling the platform API.
    return { id: 'platform-message-id', address }
  }
}
```

Implement `loadAttachment()` when normalized incoming messages expose attachment metadata, and never put authenticated download URLs or platform credentials into a normalized event.

`edit()` is optional: omit it for text-only adapters and gate calls on `capabilities.messageEdits === true && channel.edit !== undefined`. When `edit` is omitted, a channel-agent service skips live editing and delivers the completed response through `send` instead. See [Channel agent](/channels/channel-agent) for the bridge that connects an adapter to an agent.
