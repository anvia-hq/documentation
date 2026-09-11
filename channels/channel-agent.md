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
| `acknowledge` | Acceptance/completion reactions: a reaction string, full options, or `false` |
| `commands` | Slash-command handling: `true`, per-name options, or `false` (default) |
| `multimodal` | Attachment limits, or `false` to reject file input |
| `interactions` | Store, rendering, parsing, timeout, and cancel behavior, or `false` to disable |
| `errorMessage` | Failure reply shown to users, or `false` to send nothing |
| `emptyResponseMessage` | Reply when an outcome carries no visible text |
| `onError` | Error observer receiving `(error, { stage, event })` |

## Continue with

- [Filter events and scope memory](/channels/channel-agent/filtering) — routing and conversation sessions.
- [Prompts and attachments](/channels/channel-agent/prompts) — multimodal prompt preparation.
- [Streaming and delivery](/channels/channel-agent/delivery) — placeholders, edits, and splitting.
- [Slash commands and acknowledgements](/channels/channel-agent/commands) — command handling and working reactions.
- [Approvals and interactions](/channels/channel-agent/interactions) — paused tool approvals and questions.
- [Shutdown and errors](/channels/channel-agent/operations) — error stages and graceful shutdown.
- [End-to-end guide](/channels/end-to-end) — assemble the adapter, bridge, and agent in one program.
