# Approvals and interactions

When an Anvia run pauses for tool approval or a tool question, the bridge stores the continuation and renders a prompt back to the channel. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Paused runs

Native buttons are attached when `channel.capabilities.actions` is true — Approve and Deny for approvals, one button per choice for a single-choice question with at most five options — and text replies remain the fallback everywhere.

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

## Continue with

- [Filter events and scope memory](/channels/channel-agent/filtering) — interaction storage versus conversation memory.
- [Shutdown and errors](/channels/channel-agent/operations) — stop the service without stranding pendings.
