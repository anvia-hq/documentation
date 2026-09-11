# Slack messaging

Send text, thread replies, files, buttons, and message lifecycle operations through the Slack Web API. Outbound Web API calls do not require Socket Mode to be started. See [@anvia/slack](/channels/slack) for setup.

## Send messages

```ts
import { sendChannelMessage } from '@anvia/channel'

await sendChannelMessage({
  channel,
  address: { platform: 'slack', conversationId: process.env.SLACK_CHANNEL_ID! },
  message: {
    text: 'The import needs review.',
    attachments: [
      {
        type: 'file',
        mediaType: 'text/csv',
        filename: 'invalid-rows.csv',
        source: { type: 'data', data: csvBuffer.toString('base64') },
      },
    ],
  },
})
```

Text is posted first with `chat.postMessage` (link previews disabled), then files are uploaded sequentially with `files.uploadV2`. A multi-file delivery may be partially visible if a later upload fails; use idempotent application retries. `sendChannelMessage` splits text longer than 4000 characters into multiple messages and returns the sent parts. Direct `channel.send()` does not split: text over 4000 characters throws a `RangeError`, as does an empty message with no attachments.

Actions become Slack `actions` blocks with one button per action; the action `id` is returned as the `actionId` of an action event, and `style: 'primary' | 'danger'` maps to the matching Slack button color.

Model-generated text is protected against unintended notifications: token mentions such as `<@U123>`, `<!channel>`, and `<#channel>` are HTML-escaped in outbound text, and `link_names` is disabled on every post.

## Threads and replies

Slack thread timestamps map directly to `ChannelAddress.threadId`. `replyToMessageId` takes precedence when explicitly provided; otherwise sends target the address thread:

```ts
if (event.type !== 'message') return

await channel.send(
  {
    platform: 'slack',
    conversationId: event.conversation.id,
    threadId: event.conversation.threadId,
  },
  { text: 'Following up in this thread.' },
)
```

Message IDs and thread IDs are Slack timestamps such as `1712345678.123456`, not arbitrary UUIDs, and are validated before any API call. A thread reply arriving without its own mention sets `replyTo` on the message event.

## Attachments

Incoming file URLs are token-bearing and private, so they are retained only inside the validated raw event. `channel.loadAttachment()` performs an authenticated, size-capped download with the bot token and returns base64 data; the token-bearing URL never reaches the agent prompt. Download URLs are restricted to Slack-controlled HTTPS domains.

Outbound attachments accept HTTPS URLs or base64 data. Each file is downloaded or decoded, size-checked against `maximumAttachmentBytes`, and uploaded with `files.uploadV2` (into the thread when the target is threaded). A files-only message uses a zero-width-space text fallback because Slack requires one.

## Edits, deletes, and reactions

```ts
const [sent] = await sendChannelMessage({ channel, address, message })

await channel.edit(sent, { text: 'The import is under review.' })
await channel.react(sent, 'eyes')
await channel.delete(sent)
```

`edit()` accepts text-only changes; attachments and reply targets cannot be edited and throw a `TypeError`. `react()` strips surrounding colons from the emoji name before calling `reactions.add`. `unreact()` removes the bot's own reaction through `reactions.remove`, stripping colons the same way.

The adapter reports `actions`, `replies`, `reactions`, `reactionRemovals`, `delete`, and `messageEdits`, with outbound attachments of every kind. `capabilities.typing` is absent: Slack has no general bot typing-indicator API, so there is no `showTyping`. Use the [channel agent](/channels/channel-agent) placeholder message when users need progress feedback.

## Continue with

- [Receive Slack events](/channels/slack/receiving) — Socket Mode input and normalization.
- [Custom Slack transport](/channels/slack/transport) — own the transport and shut down cleanly.
