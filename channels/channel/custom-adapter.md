# Build a custom adapter

Implement `Channel<RawEvent>` and keep every platform SDK type inside the adapter package. See [Channel core](/channels/channel) for the shared types, and [Capabilities and rate limits](/channels/channel/capabilities) for the optional operations.

## Required members

Five members are required:

- `platform` names the adapter and must match `ChannelAddress.platform`.
- `splitMessage(message)` bounds output for the platform.
- `start(handler)` connects and begins delivering normalized events through `handler`.
- `stop()` detaches listeners and drains in-flight deliveries.
- `send(address, message)` delivers one already-bounded message.

`capabilities`, `loadAttachment(event, attachment, signal?)`, `edit(sent, message)`, `delete(sent)`, `showTyping(address)`, `react(sent, reaction)`, and `unreact(sent, reaction)` are optional.

```ts
import { splitChannelMessage } from '@anvia/channel'
import { validateOutboundChannelMessage } from '@anvia/channel/adapter'
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
    validateOutboundChannelMessage(message, { platformLabel: 'Acme', maximumLength: 2_000 })
    // Validate the address, then call the platform API.
    return { id: 'platform-message-id', address }
  }
}
```

Implement `loadAttachment()` when normalized incoming messages expose attachment metadata. It receives the original `message` event plus the attachment metadata and an optional `AbortSignal`, and resolves to `{ type: 'url', url }` or `{ type: 'data', data }`, where `data` is a base64-encoded string. Never put authenticated download URLs or platform credentials into a normalized event.

`splitMessage()` must return at least one message — returning an empty array makes `sendChannelMessage()` throw instead of delivering nothing.

`edit()` is optional: omit it for text-only adapters, and in generic code gate calls on `capabilities.messageEdits === true && channel.edit !== undefined`. The channel-agent bridge is more permissive: it streams live edits whenever `edit` is implemented and `capabilities.messageEdits` is not `false`, so an adapter that implements `edit` without declaring capabilities still gets live editing. Set `messageEdits: false` to opt out. When `edit` is omitted, a channel-agent service skips live editing and delivers the completed response through `send` instead. See [Channel agent](/channels/channel-agent) for the bridge that connects an adapter to an agent.

## Adapter utilities

The `@anvia/channel/adapter` subpath exports zero-dependency helpers the first-party adapters share. They are for adapter authors; application code does not need them.

```ts
import {
  BoundedMap,
  BoundedSet,
  attachmentTypeFromMediaType,
  base64ByteLength,
  isRecord,
  isValidBase64,
  readBoundedResponseBuffer,
  reportChannelError,
  reportErrorSafely,
  validateOutboundChannelMessage,
} from '@anvia/channel/adapter'
import type { Mutable } from '@anvia/channel/adapter'
```

| Utility | Behavior |
| --- | --- |
| `validateOutboundChannelMessage(message, { platformLabel, maximumLength })` | Throws a `TypeError` when the message has neither text nor attachments, a `RangeError` when text exceeds `maximumLength`, then runs `validateChannelMessage()`. Call it at the top of `send()`. |
| `readBoundedResponseBuffer(response, { maximumBytes, label })` | Reads a `fetch` `Response` body into a `Buffer`, rejecting with a `RangeError` when `content-length` or the streamed size exceeds `maximumBytes`. Use it in `loadAttachment()`. |
| `attachmentTypeFromMediaType(mediaType)` | Maps `image/*`, `audio/*`, and `video/*` to the matching `ChannelAttachmentType`; everything else, including `undefined`, becomes `'file'`. |
| `base64ByteLength(value, { allowEmpty?, maximumBytes? })` | Returns the decoded byte length of a base64 string, throwing a `TypeError` for invalid or (unless `allowEmpty`) empty input. With `maximumBytes`, an oversized string returns `maximumBytes + 1` without being fully validated. |
| `isValidBase64(value)` | Checks base64 alphabet and padding. |
| `isRecord(value)` | Narrows to a non-array object. |
| `BoundedSet<Value>(maximumSize)` / `BoundedMap<Key, Value>(maximumSize)` | Insertion-ordered collections that evict the oldest entry past `maximumSize` (a positive safe integer); `BoundedMap.set()` refreshes a key's position. Use them for deduplication and caches. |
| `reportChannelError(onError, error, context)` / `reportErrorSafely(onError, error)` | Await an optional error callback and swallow anything it throws, so a failing reporter never breaks delivery. |
| `Mutable<T>` | Removes `readonly` from a type's properties while building normalized events. |
