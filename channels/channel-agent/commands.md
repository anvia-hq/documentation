# Slash commands and acknowledgements

The bridge opts into platform slash commands on request and reacts to the incoming message while the agent works. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Slash commands

The Discord, Slack, and Telegram adapters emit a shared `ChannelCommandEvent` for platform slash-command invocations (`/ask …`), carrying the command `name` without the slash and the argument `text`. The service ignores them by default; opt in with `commands: true`:

```ts
const service = createChannelAgent({
  channel,
  agent,
  commands: true,
})
```

An accepted command runs the agent with the prompt `/<name> <text>`; bot-authored commands are always ignored. For per-name control, pass options instead of `true`:

```ts
const service = createChannelAgent({
  channel,
  agent,
  commands: {
    shouldHandle: async (event) => event.name !== 'admin',
    commands: {
      ask: {
        createPrompt: ({ event }) => `Research carefully: ${event.text}`,
        createSession: () => undefined, // run /ask without memory
      },
    },
  },
})
```

Every field of a per-command handler is optional: anything omitted falls back to the shared `createPrompt`, `createSession`, and `renderOutcome` behavior, and `shouldHandle` adds an extra filter for that name on top of the shared one.

## Acknowledgement reactions

React to the incoming message while the agent works on it. A string is shorthand for the acceptance reaction; `false` disables acknowledgements:

```ts
const service = createChannelAgent({
  channel,
  agent,
  acknowledge: '👀',
})
```

Both reactions require `channel.capabilities.reactions` and `channel.react`. For the full lifecycle, pass options: `completeReaction` is added once a final response is delivered, and `clearOnCompletion` (default `true` when a completion reaction is configured) removes the acceptance reaction again wherever the adapter supports removals:

```ts
const service = createChannelAgent({
  channel,
  agent,
  acknowledge: {
    reaction: '👀',
    completeReaction: '✅',
    clearOnCompletion: true,
  },
})
```

## Continue with

- [Streaming and delivery](/channels/channel-agent/delivery) — how the final answer reaches the channel.
- [Approvals and interactions](/channels/channel-agent/interactions) — resume paused tool approvals and questions.
