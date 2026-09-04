# @anvia/channel-agent

`@anvia/channel-agent` connects one `Channel` adapter to one Anvia agent executor, owning everything between a platform event and a delivered reply: filtering, conversation serialization, prompt preparation, streaming edits, long-message splitting, and paused interactions.

Complete [Install and setup](/sdk/install-and-setup) first if you have not built an agent yet; start with [Your first agent](/sdk/your-first-agent).

## Create the service

`createChannelAgent()` returns a `ChannelAgentService` that you start yourself:

```ts
import { createChannelAgent } from '@anvia/channel-agent'

const service = createChannelAgent({
  channel,
  agent,
  streaming: {
    placeholder: 'Thinking…',
    editIntervalMs: 750,
  },
  onError(error, context) {
    console.error(context.stage, error)
  },
})

await service.start()
```

The service starts the adapter, serializes runs inside one conversation and thread, streams text through message edits, splits long final output, and stops the adapter when `service.stop()` is called. Do not also call `channel.start()`; the service owns the adapter lifecycle.

Use `serveChannelAgent()` when a small executable wants an already-started service:

```ts
import { serveChannelAgent } from '@anvia/channel-agent'

const service = await serveChannelAgent({ channel, agent })
```

Both functions return a `ChannelAgentService`, and both must be stopped.

## Filter incoming events

The default filter (`defaultShouldHandleChannelEvent`) handles non-bot messages that arrive as direct messages or mention the bot. Bot-authored events, action events, and lifecycle events such as edits and reactions never start agent runs.

Override `shouldHandle` for product-specific routing:

```ts
const service = createChannelAgent({
  channel,
  agent,
  shouldHandle(event) {
    return event.conversation.kind === 'direct' || event.text.startsWith('/ask ')
  },
})
```

Errors thrown by the filter are reported with the `filter` stage and the message is skipped.

## Conversation memory scope

The bridge chooses the `session` scope passed to every run; the agent's memory store itself is configured through `@anvia/core` (see [Memory](/sdk/memory)).

| Product behavior | `createSession` value |
| --- | --- |
| Each sender has private history in a group | omit it (default) or use `channelConversationUserSession` |
| Everyone in one channel or thread shares history | `channelConversationSession` |
| No memory for an event | custom function returning `undefined` |
| Custom tenant or user mapping | custom function returning your `MemoryScope` |

The default is sender-isolated: history is scoped by platform, bot account, conversation, thread, and sender. If the executor exposes no memory store, the bridge runs without a session instead of throwing a session-without-memory error.

```ts
import { channelConversationSession } from '@anvia/channel-agent'

const service = createChannelAgent({ channel, agent, createSession: channelConversationSession })
```

`channelConversationUserSession()` states the default explicitly, and `channelConversationKey()` returns the stable conversation key the bridge uses for queueing and session IDs.

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

## Approvals and questions

When an Anvia run pauses for tool approval or a tool question, the service stores the continuation and renders a prompt. Native buttons are attached when `channel.capabilities.actions` is true — Approve and Deny for approvals, one button per choice for a single-choice question with at most five options — and text replies remain the fallback everywhere.

Each message event claims its conversation-plus-sender slot in the interaction store, so one pending interaction per conversation and sender is resumable at a time. Text replies are parsed by `parseChannelAgentInteractionResponse()` (`approve`, `yes`, `deny`, `no`, and variants; one answer per line for multiple questions), button clicks by `parseChannelAgentActionResponse()`. Presentation is customized with `renderChannelAgentInteraction()` or the `interactions.render` option.

For development within one process, the default `MemoryChannelAgentInteractionStore` is enough. For a restart-safe service, use SQLite:

```ts
import { SqliteChannelAgentInteractionStore } from '@anvia/channel-agent'

const interactionStore = new SqliteChannelAgentInteractionStore({
  database: 'data/channel-interactions.sqlite',
  table: 'anvia_channel_interactions',
})
```

```ts
const service = createChannelAgent({
  channel,
  agent,
  interactions: {
    store: interactionStore,
    invalidResponseMessage: 'Choose one of the available answers.',
  },
})
```

Interaction storage and conversation memory are different: conversation memory preserves chat history and belongs to the agent, while interaction storage preserves a paused continuation and belongs to the bridge.

Pending interactions fail safely:

- `interactions.timeoutMs` expires a pending interaction after the given delay; expired pendings are treated as absent and answered with `expiredInteractionMessage`.
- Replying with `cancel` (default keyword, replaceable or disabled with `cancelKeyword: false`) abandons the pending interaction and confirms with `cancelMessage`.
- If rendering or delivering an interaction prompt fails, the pending interaction is rolled back, so a prompt the user never saw can never be resumed by a later reply.
- Claiming a continuation is atomic, but a retry after a process or network failure cannot guarantee exactly-once side effects; keep externally mutating tools idempotent.

## Errors

`onError(error, context)` observes every failure with a `context.stage` of `filter`, `prepare`, `interaction`, `agent`, or `delivery`. Observed errors never interrupt delivery: the user receives `errorMessage` (default `Sorry, I couldn't process that message.`, disable with `errorMessage: false`). An outcome with no text and no attachments is answered with `emptyResponseMessage`.

## Graceful shutdown

`service.stop()` aborts in-flight and queued runs, stops the adapter, and drains queued conversations. Stop the service before closing the databases it may still use:

```ts
try {
  await service.stop()
} finally {
  interactionStore.close()
}
```

Make shutdown idempotent when registering both `SIGINT` and `SIGTERM` handlers. On shutdown, an already-sent streaming placeholder is deleted or replaced with a short `(interrupted)` note instead of being left dangling.

## Configuration options

| Option | Purpose |
| --- | --- |
| `channel` | The adapter whose lifecycle the service owns |
| `agent` | Executor with `generate()`, `stream()`, and optional `resume()`; an Anvia `Agent` satisfies it |
| `shouldHandle` | Message filter; defaults to direct messages and mentions |
| `createPrompt` | Prompt builder; defaults to `channelMessagePrompt()` under the `multimodal` policy |
| `createSession` | Memory scope factory; defaults to sender-isolated sessions |
| `renderOutcome` | Final response renderer; returns a string or `ChannelMessage` |
| `streaming` | `enabled`, `placeholder`, `editIntervalMs` |
| `multimodal` | Attachment limits, or `false` to reject file input |
| `interactions` | Store, rendering, parsing, timeout, and cancel behavior, or `false` to disable |
| `errorMessage` | Failure reply shown to users, or `false` to send nothing |
| `emptyResponseMessage` | Reply when an outcome carries no visible text |
| `onError` | Error observer receiving `(error, { stage, event })` |

## Continue with

- [End-to-end guide](/channels/end-to-end) — assemble the adapter, bridge, and agent in one program.
- [Channel core](/channels/channel) — the `Channel` contract, splitting, and delivery helpers.
- [Discord](/channels/discord), [Slack](/channels/slack), [Telegram](/channels/telegram) — platform adapters.
