# Tool call

A complete tool exchange contains an assistant tool-call block followed by a matching tool-result message. Preserve both sides in order so the next model turn knows what it requested and what the application returned.

## 1. Create the assistant tool call

```ts
import type { AssistantMessage } from '@anvia/core'

const assistant: AssistantMessage = {
  role: 'assistant',
  content: [{
    type: 'tool-call',
    toolCallId: 'tool_123',
    callId: 'call_123',
    toolName: 'get_invoice',
    input: { invoiceId: 'inv_123' },
  }],
}
```

The arguments must be a strict JSON value. `id` is Anvia's normalized tool-content identifier. `callId` preserves a distinct provider call identifier when the adapter supplies one.

## 2. Add the matching result

```ts
const tool: ToolMessage = {
  role: 'tool',
  content: [{
    type: 'tool-result',
    toolCallId: 'tool_123',
    callId: 'call_123',
    toolName: 'get_invoice',
    output: {
      type: 'json',
      value: { id: 'inv_123', status: 'paid', totalCents: 4900 },
    },
  }],
}
```

Use the same `id` and, when present, the same `callId` as the assistant tool call. Provider adapters serialize the provider-facing identifier as `callId ?? id`.

Choose an explicit output discriminant such as `text`, `json`, `content`, `execution-denied`, `error-text`, or `error-json`. Values must be strict JSON where required.

## 3. Return structured tool content

Pass a non-empty text or image content array when the tool result must preserve more than one block:

```ts
const tool: ToolMessage = {
  role: 'tool',
  content: [{
    type: 'tool-result',
    toolCallId: 'tool_123',
    callId: 'call_123',
    toolName: 'get_invoice',
    output: {
      type: 'content',
      value: [
        { type: 'text', text: 'Invoice inv_123 is paid.' },
        {
          type: 'file',
          data: { type: 'data', data: receiptBase64 },
          mediaType: 'image/png',
        },
      ],
    },
  }],
}
```

Not every provider accepts image tool results. Check the exact adapter and model behavior before depending on that content in a later turn.

## 4. Continue the transcript

```ts
const transcript = [
  { role: 'user', content: 'Is invoice inv_123 paid?' },
  assistant,
  tool,
  { role: 'user', content: 'Explain the result in one sentence.' },
]

const result = await generateCompletion({
    messages: transcript,
    model
})
```

A direct completion can return tool calls when definitions are supplied, but it does not execute local tools. An [agent](/sdk/agents) performs the tool loop, handles approvals, records tool messages, and calls the model again.

Tool arguments and results may contain private account or service data even when the final answer is safe. Apply authorization, redaction, retention, and client-event filtering to the complete exchange.

Continue with [Reasoning](/sdk/messages/reasoning).
