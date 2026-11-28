# Approvals and interactions

When an Anvia run pauses for tool approval or a tool question, the bridge stores the continuation and renders a prompt back to the channel. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Paused runs

Native buttons are attached when `channel.capabilities.actions` is true — Approve and Deny for approvals, one button per choice for a single-choice question with at most five options — and text replies remain the fallback everywhere. Approval prompts preview the tool input with credential-like keys and values (API keys, tokens, JWTs, private keys) replaced by `[redacted]`, truncated to 1,000 characters.

Each message event claims its conversation-plus-sender slot in the interaction store (`channelInteractionKey()`), so one pending interaction per conversation and sender is resumable at a time. Button IDs embed a random per-interaction token (`channelInteractionActions()` builds them), and a click is looked up under the clicking user's own slot, so only the user who triggered the paused run can answer it, and buttons from an older prompt no longer match. Bot-authored clicks are ignored. Text replies are parsed by `parseChannelAgentInteractionResponse()` (case-insensitive: `approve`/`approved`/`yes`/`y` to approve, `deny`/`denied`/`no`/`n`/`reject`/`rejected` to deny; one answer per line for multiple questions), button clicks by `parseChannelAgentActionResponse()`. After a button-click resume, `renderOutcome` receives the `action` event rather than the original message — use it to confirm what was approved. Presentation is customized with `renderChannelAgentInteraction()` or the `interactions.render` option.

For development within one process, the default in-process store (`MemoryChannelAgentInteractionStore`) is enough: interactions are on by default, and without options the bridge keeps pendings there. Pass `interactions: false` to disable them — a run that then pauses for input gets a default needs-more-input reply instead. For a restart-safe service, use SQLite:

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

The `database` option also accepts an existing `node:sqlite` `DatabaseSync` handle (only path-created databases are closed by `close()`); the default table is `anvia_channel_interactions`.

To keep pendings somewhere else, implement `ChannelAgentInteractionStore`. Each method may be synchronous or return a promise:

| Method | Contract |
| --- | --- |
| `get(key)` | Return the pending interaction for the slot, or `undefined` when absent or expired |
| `set(key, pending)` | Store or replace the slot's pending interaction |
| `take({ key, interactionId })` | Atomically remove and return the pending interaction only when its `interaction.id` matches and it has not expired; otherwise return `undefined` |
| `delete({ key, interactionId })` | Remove the slot only when its `interaction.id` matches |

`take()` is what makes a continuation resumable at most once, so a shared store must implement it atomically, for example with a conditional delete. `PendingChannelAgentInteraction` carries the `continuation`, the `interaction` request, an optional `actionToken`, and an optional `expiresAt` timestamp in milliseconds.

Interaction storage and conversation memory are different: conversation memory preserves chat history and belongs to the agent, while interaction storage preserves a paused continuation and belongs to the bridge.

Pending interactions fail safely:

- `interactions.timeoutMs` expires a pending interaction after the given delay, and expired pendings are treated as absent. A text reply after expiry therefore starts a new agent run like any other message. `expiredInteractionMessage` is sent when a button is clicked for a missing or expired interaction, when a button no longer matches the pending prompt, or when another reply claimed the continuation first.
- A text reply that the parser cannot read keeps the pending interaction in place and is answered with `invalidResponseMessage`, so the user can try again.
- Replying with `cancel` (matched case-insensitively; default keyword, replaceable or disabled with `cancelKeyword: false`) abandons the pending interaction and confirms with `cancelMessage`. A store failure during cancel is reported with the `interaction` stage.
- If a resume cannot start (the placeholder cannot be delivered) or `agent.resume()` fails or times out, the claimed continuation is written back to the store, so the user can answer again.
- If rendering or delivering an interaction prompt fails, the pending interaction is rolled back, so a prompt the user never saw can never be resumed by a later reply.
- Claiming a continuation is atomic, but a retry after a process or network failure cannot guarantee exactly-once side effects; keep externally mutating tools idempotent.

## Continue with

- [Filter events and scope memory](/channels/channel-agent/filtering) — interaction storage versus conversation memory.
- [Shutdown and errors](/channels/channel-agent/operations) — stop the service without stranding pendings.
