# Streaming and delivery

The bridge streams the agent's answer through live message edits, then splits the final response with the adapter's `splitMessage()`. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Streaming and long messages

Streaming is on by default; it turns off only when you set `streaming.enabled: false` or the model advertises `capabilities.streaming: false`. While a run streams, the service edits the placeholder message at most once per `editIntervalMs` (default 750 ms) and only the first message part. Placeholder delivery requires `channel.edit`; without it the service buffers and sends only the final response.

Disable the placeholder to skip the provisional message entirely:

```ts
const service = createChannelAgent({
  channel,
  agent,
  streaming: { placeholder: false },
})
```

The final response is split by the adapter's `splitMessage()` (Discord 2,000, Slack 4,000, Telegram 4,096 characters). When a placeholder is on screen, its message is edited into the first part and the remaining parts are sent as new messages.

`renderOutcome` may return a string or a complete `ChannelMessage`:

```ts
const service = createChannelAgent({
  channel,
  agent,
  renderOutcome({ outcome }) {
    if (outcome.type !== 'response') return outcome.text

    return {
      text: outcome.text,
      attachments: [
        {
          type: 'file',
          mediaType: 'application/json',
          filename: 'result.json',
          source: {
            type: 'data',
            data: Buffer.from(JSON.stringify(outcome.output)).toString('base64'),
          },
        },
      ],
    }
  },
})
```

A rich final message with attachments is sent first and the placeholder is then deleted, which requires the adapter's `delete` capability. Attachment-capable adapters without delete support never get a placeholder in the first place.

## Continue with

- [Prompts and attachments](/channels/channel-agent/prompts) — what feeds the run being streamed.
- [Slash commands and acknowledgements](/channels/channel-agent/commands) — command prompts and working reactions.
