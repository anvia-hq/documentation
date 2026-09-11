# Splitting and validation

Adapters own their platform text limits; the shared package provides the splitting helpers and the portable payload validators they all build on. See [Channel core](/channels/channel) for the full utility map.

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

## Continue with

- [Send channel messages](/channels/channel/sending) — how splitting applies during delivery.
- [Capabilities and rate limits](/channels/channel/capabilities) — gate optional operations and pace outbound calls.
