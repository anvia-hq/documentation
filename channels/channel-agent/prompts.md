# Prompts and attachments

The bridge turns an incoming channel event into an agent prompt, loading attachment bytes only during prompt preparation. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Multimodal prompts

The default prompt stays a plain string for text-only messages and becomes multimodal content when attachments are present. The adapter loads authenticated bytes only during prompt preparation, bounded by the `multimodal` policy.

Defaults: 10 attachments, 20 MiB per file, 50 MiB total, and 2 concurrent loads.

```ts
const service = createChannelAgent({
  channel,
  agent,
  multimodal: {
    maximumAttachments: 5,
    maximumAttachmentBytes: 10 * 1024 * 1024,
    maximumTotalAttachmentBytes: 25 * 1024 * 1024,
    attachmentConcurrency: 2,
  },
})
```

Use `channelMessagePrompt()` inside a custom `createPrompt` so custom instructions do not silently discard attachments:

```ts
import { channelMessagePrompt } from '@anvia/channel-agent'

const service = createChannelAgent({
  channel,
  agent,
  async createPrompt(request) {
    return channelMessagePrompt({
      channel: request.context.channel,
      event: request.event,
      signal: request.context.abortSignal,
      maximumAttachments: 3,
    })
  },
})
```

Set `multimodal: false` to reject attachment-bearing input before the model runs.

## Continue with

- [Filter events and scope memory](/channels/channel-agent/filtering) — decide which events reach the agent.
- [Streaming and delivery](/channels/channel-agent/delivery) — render the outcome back to the channel.
