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
- `maximumLength` must be a positive safe integer (`TypeError` otherwise); a `maximumLength` too small to hold one Unicode character throws a `RangeError`.
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
- Action IDs are non-empty and unique within a message (`TypeError` when empty or duplicated) and at most 64 UTF-8 bytes (`RangeError` when overlong; `isChannelActionId()` checks the shape).
- Action `style` is `'default'`, `'primary'`, or `'danger'` (default when omitted); anything else throws a `TypeError`.
- At most 10 outbound attachments per logical message (`MAX_CHANNEL_ATTACHMENTS`).
- Attachment `url` sources must use HTTPS; `data` sources must be valid base64. `mediaType` must be non-empty, `filename` non-empty when present, and `size` a non-negative safe integer when present.
- When present, `actions` and `attachments` must be non-empty arrays.

`validateChannelMessage()` checks only actions and attachments — it does not validate text length, which is the adapter's `splitMessage()` job. Use the exported `MAX_CHANNEL_*` constants when an application UI needs to enforce the same limits.

## Continue with

- [Send channel messages](/channels/channel/sending) — how splitting applies during delivery.
- [Capabilities and rate limits](/channels/channel/capabilities) — gate optional operations and pace outbound calls.
