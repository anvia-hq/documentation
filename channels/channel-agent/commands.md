# Slash commands and acknowledgements

The bridge opts into platform slash commands on request and reacts to the incoming message while the agent works. See [Channel agent](/channels/channel-agent) for service setup and the full option reference.

## Slash commands

The Discord, Slack, and Telegram adapters emit a shared `ChannelCommandEvent` for platform slash-command invocations (`/ask …`), carrying the command `name` without the slash and the argument `text`. The service ignores them by default; opt in with `commands: true` to accept every command:

```ts
const service = createChannelAgent({
  channel,
  agent,
  commands: true,
})
```

An accepted command runs the agent with the prompt `/<name> <text>`; bot-authored commands are always ignored.

::: warning Commands bypass the message filter
The top-level `shouldHandle` applies to `message` events only and is never called for commands. With `commands: true`, the command filter defaults to `() => true`, so any user can run any command the platform delivers, in any conversation the bot can see. Put authorization and routing in `commands.shouldHandle` (and per-command `shouldHandle`) before enabling commands in shared workspaces.
:::

For per-name control, pass options instead of `true`:

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

Every field of a per-command handler (`ChannelAgentCommandHandler`) is optional: anything omitted falls back to the shared `createPrompt`, `createSession`, and `renderOutcome` behavior, and `shouldHandle` adds an extra filter for that name on top of `commands.shouldHandle`. Commands with no entry under `commands` still run when `commands.shouldHandle` accepts them. Filter errors are reported with the `filter` stage and the command is skipped.

## Register the command on each platform

The bridge only handles invocations the platform delivers — register the command itself first:

- **Slack**: register the command under Slash Commands in your app config and run the app in Socket Mode; the payload arrives as a `slash_commands` envelope and is acknowledged automatically.
- **Discord**: register the application command (through the developer portal or a registration script). The gateway handles chat-input interactions; command replies are delivered through the interaction webhook, including subsequent edits and follow-ups. The adapter preserves that reply routing through asynchronous handling; do not replace it with an unrelated channel send.
- **Telegram**: commands (`/ask@botname`, `/ask`) are messages with a `bot_command` entity; the adapter emits a `command` event for those addressed to this bot. Publish the command list through BotFather or `setMyCommands`.

Bot-authored commands are always ignored. A command accepted by `commands.shouldHandle` then runs through the same pipeline as a message: acknowledgement reactions, sessions, streaming, and interactions all apply. Only the filtering step differs, as described above.

## Acknowledgement reactions

Acknowledgements are off by default. Set `acknowledge` to react to the incoming message while the agent works on it. A string is shorthand for the acceptance reaction; `false` disables acknowledgements:

```ts
const service = createChannelAgent({
  channel,
  agent,
  acknowledge: '👀',
})
```

Both reactions require `channel.capabilities.reactions` and `channel.react`. The string shorthand only adds the acceptance reaction; nothing is cleaned up afterwards. For the full lifecycle, pass options: `completeReaction` is added once a final response is delivered, and `clearOnCompletion` (default `true` when a completion reaction is configured) removes the acceptance reaction again wherever the adapter supports removals. Without `completeReaction`, no completion cleanup runs:

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

Behaviour and limits: only messages that pass `shouldHandle` and commands that pass `commands.shouldHandle` are acknowledged (filtered, bot-authored, button-action, and lifecycle events never get reactions); all three standard adapters support reactions; a failed acknowledgement is reported through `onError` with the `acknowledge` stage and never interrupts the run; `false` (or omitting the option) disables acknowledgements.

## Continue with

- [Streaming and delivery](/channels/channel-agent/delivery) — how the final answer reaches the channel.
- [Approvals and interactions](/channels/channel-agent/interactions) — resume paused tool approvals and questions.
