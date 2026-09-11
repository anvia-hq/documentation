# Send channel messages

Outbound delivery in `@anvia/channel` has two layers: `sendChannelMessage()` for complete portable messages that may need splitting, and `channel.send()` for one already-bounded message. See [Channel core](/channels/channel) for addresses and the full utility map.

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

## URL-backed attachments

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

## Continue with

- [Channel core](/channels/channel) — addresses and the utility map.
- [Channel events](/channels/channel/events) — handle normalized inbound events.
- [Splitting and validation](/channels/channel/splitting) — text limits and portable payload rules.
