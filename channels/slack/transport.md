# Custom Slack transport

Inject a `SlackTransport` when another layer owns Socket Mode or when tests need a fake transport. See [@anvia/slack](/channels/slack) for standard setup.

## Inject a transport

```ts
import { SlackChannel } from '@anvia/slack'

const channel = new SlackChannel({ transport: existingSlackTransport })
```

The transport must parse and validate external payloads into `SlackSocketEvent` values (use `parseSlackSocketEvent()`, `parseSlackSocketInteraction()`, and `parseSlackSocketCommand()` — without the last, slash commands are silently dropped), acknowledge Slack envelopes promptly, implement the `start`/`stop` lifecycle plus the Web API operations (`send`, `edit`, `delete`, `react`, `removeReaction`, `loadAttachment`), and drain active handlers during shutdown. `SlackSocketTransport` is a reference implementation.

## Shutdown

```ts
await channel.stop()
```

Stopping detaches listeners, disconnects Socket Mode, and waits for in-flight deliveries. Stop the [channel agent](/channels/channel-agent) service instead when it owns the channel.

## Continue with

- [Receive Slack events](/channels/slack/receiving) — what the transport delivers.
- [Slack messaging](/channels/slack/messaging) — the Web API operations a custom transport must implement.
