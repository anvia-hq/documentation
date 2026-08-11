# Tool call

A complete tool exchange contains an assistant tool-call message followed by a tool-result message. Preserve both so later turns know what the model requested and what the application returned.

## Create a tool call

```ts
import { AssistantContent, Message } from '@anvia/core'

const assistant = Message.assistant([
  AssistantContent.toolCall(
    'tool_123',
    'get_invoice',
    { invoiceId: 'inv_123' },
  ),
])
```

The ID connects the assistant request with the resulting tool message.

## Add the result

```ts
const tool = Message.toolResult(
  'tool_123',
  {
    id: 'inv_123',
    status: 'paid',
    totalCents: 4900,
  },
  { toolName: 'get_invoice' },
)
```

`Message.toolResult(...)` serializes normal object output and preserves structured tool-result content when supplied.

## Preserve the exchange

Memory-backed agent sessions store tool calls and results as runtime messages. If an application stores only the final assistant answer, the next run may repeat the tool because the evidence is missing from its transcript.

Apply product retention and redaction rules to tool arguments and results. They may contain private account or service data even when the final answer is safe to show.
