# Build a custom adapter

Implement `Channel<RawEvent>` and keep every platform SDK type inside the adapter package. See [Channel core](/channels/channel) for the shared types, and [Capabilities and rate limits](/channels/channel/capabilities) for the optional operations.

## Required members

Five members are required:

- `platform` names the adapter and must match `ChannelAddress.platform`.
- `splitMessage(message)` bounds output for the platform.
- `start(handler)` connects and begins delivering normalized events through `handler`.
- `stop()` detaches listeners and drains in-flight deliveries.
- `send(address, message)` delivers one already-bounded message.

`capabilities`, `loadAttachment(event, attachment, signal?)`, `edit(sent, message)`, `delete(sent)`, `showTyping(address)`, `react(sent, reaction)`, and `unreact(sent, reaction)` are optional.

```ts
import { splitChannelMessage } from '@anvia/channel'
import type {
  Channel,
  ChannelAddress,
  ChannelEventHandler,
  ChannelMessage,
  SentChannelMessage,
} from '@anvia/channel'

type AcmeEvent = Readonly<{ id: string; body: unknown }>

export class AcmeChannel implements Channel<AcmeEvent> {
  readonly platform = 'acme'
  readonly capabilities = { actions: false } as const

  splitMessage(message: ChannelMessage): readonly ChannelMessage[] {
    return splitChannelMessage({ message, maximumLength: 2_000 })
  }

  async start(handler: ChannelEventHandler<AcmeEvent>): Promise<void> {
    // Connect the Acme SDK, validate its payloads, normalize them, then await handler(event).
  }

  async stop(): Promise<void> {
    // Detach listeners, close the SDK client, and drain in-flight deliveries.
  }

  async send(address: ChannelAddress, message: ChannelMessage): Promise<SentChannelMessage> {
    // Validate the address and message before calling the platform API.
    return { id: 'platform-message-id', address }
  }
}
```

Implement `loadAttachment()` when normalized incoming messages expose attachment metadata, and never put authenticated download URLs or platform credentials into a normalized event.

`edit()` is optional: omit it for text-only adapters and gate calls on `capabilities.messageEdits === true && channel.edit !== undefined`. When `edit` is omitted, a channel-agent service skips live editing and delivers the completed response through `send` instead. See [Channel agent](/channels/channel-agent) for the bridge that connects an adapter to an agent.
