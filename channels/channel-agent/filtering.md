# Filter events and scope memory

The bridge decides which events reach the agent and which conversation history each run sees. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Filter incoming events

The default filter (`defaultShouldHandleChannelEvent`) handles non-bot messages that arrive as direct messages or mention the bot. Lifecycle events such as edits, deletions, and reactions never start agent runs. Action events never start *new* runs — they resume a paused approval or question via `agent.resume()` (see [Approvals and interactions](/channels/channel-agent/interactions)). Bot-authored actions and commands are always dropped by the bridge.

`shouldHandle` runs for `message` events only; commands use `commands.shouldHandle` instead (see [Slash commands](/channels/channel-agent/commands)). Override it for product-specific routing:

```ts
const service = createChannelAgent({
  channel,
  agent,
  shouldHandle(event) {
    if (event.sender.bot) return false
    return event.conversation.kind === 'direct' || event.text.startsWith('/ask ')
  },
})
```

Only the default filter excludes bot-authored messages. A custom `shouldHandle` replaces it entirely, so check `event.sender.bot` yourself unless you intend bots to start runs (and guard against two bots answering each other).

Errors thrown by the filter are reported with the `filter` stage and the message is skipped.

## Conversation memory scope

The bridge chooses the `session` scope passed to every run; the agent's memory store itself is configured through `@anvia/core` (see [Memory](/sdk/memory)).

| Product behavior | `createSession` value |
| --- | --- |
| Each sender has private history in a group | omit it (the default, `defaultChannelAgentSession`) or use `channelConversationUserSession` |
| Everyone in one channel or thread shares history | `channelConversationSession` |
| No memory for an event | custom function returning `undefined` |
| Custom tenant or user mapping | custom function returning your `MemoryScope` |

The default is sender-isolated: history is scoped by platform, bot account, conversation, thread, and sender. If the executor exposes no memory store, the bridge runs without a session instead of throwing a session-without-memory error.

```ts
import { channelConversationSession } from '@anvia/channel-agent'

const service = createChannelAgent({ channel, agent, createSession: channelConversationSession })
```

`channelConversationUserSession()` states the default explicitly, and `channelConversationKey()` returns the stable conversation key the bridge uses for queueing and session IDs.

## Continue with

- [Prompts and attachments](/channels/channel-agent/prompts) — build multimodal prompts without dropping files.
- [Streaming and delivery](/channels/channel-agent/delivery) — placeholders, edits, and long-message splitting.
