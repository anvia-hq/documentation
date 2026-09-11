# Receive Slack events

Inbound events arrive through Slack Socket Mode and are normalized into shared `ChannelEvent` values before reaching your handler. See [@anvia/slack](/channels/slack) for setup.

## Start the handler

```ts
await channel.start(async (event) => {
  if (event.type === 'message') {
    console.log(event.text, event.attachments, event.conversation.threadId)
  }
  if (event.type === 'action') {
    console.log(event.actionId)
  }
})
```

Socket envelopes are acknowledged before handler execution, so Slack does not re-deliver while the handler runs. Duplicate deliveries are suppressed with a bounded in-memory set of event IDs, and bot-authored events are filtered before the application handler runs. Handler failures are reported through `onError` without disconnecting.

On start, the adapter calls `auth.test` to resolve the team and bot user identity before accepting events. Direct messages and app-home conversations normalize with conversation kind `'direct'`, multi-party direct messages with `'group'`, and channels with `'channel'`. A message is flagged `mentionedBot` for `app_mention` events or when its text contains the bot user mention.

## Continue with

- [Slack messaging](/channels/slack/messaging) — reply in threads and manage messages.
- [Custom Slack transport](/channels/slack/transport) — replace the transport and shut down cleanly.
