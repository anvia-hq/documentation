# Message roles

Every message has exactly one role. The role determines the valid content shape and how provider adapters serialize the transcript.

## 1. System messages

A system message contains one instruction string:

```ts
import type { SystemMessage } from '@anvia/core'

const system: SystemMessage = {
  role: 'system',
  content: 'Act as a support assistant. Be concise and state uncertainty.',
}
```

Use system messages when behavior belongs inside a manually managed transcript. Direct completions and agents can also receive separate `instructions`; keep the combined instruction hierarchy intentional.

## 2. User messages

A user message accepts a string or an array of text, image, and document blocks:

```ts
import type { UserMessage } from '@anvia/core'

const textOnly: UserMessage = {
  role: 'user',
  content: 'Why did this checkout fail?',
}

const multimodal: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Explain the error shown in this screenshot.' },
    {
      type: 'image',
      image: { type: 'url', url: 'https://files.example.com/checkout-error.png' },
      detail: 'high',
    },
  ],
}
```

A string is normalized to one `text` block. File and image support depends on the completion model.

## 3. Assistant messages

An assistant message stores model output such as text, images, reasoning, and tool calls:

```ts
import type { AssistantMessage } from '@anvia/core'

const assistant: AssistantMessage = {
  role: 'assistant',
  id: 'msg_123',
  content: 'The payment provider rejected the authorization.',
}
```

Preserve the provider message ID when it is available. Some adapters need message or content identifiers to continue provider-native state correctly.

## 4. Tool messages

A tool message returns the result of an assistant tool call:

```ts
const tool = {
  role: 'tool',
  content: [{
    type: 'tool-result',
    toolCallId: 'tool_123',
    callId: 'call_123',
    toolName: 'get_invoice',
    output: { type: 'json', value: { status: 'paid', totalCents: 4900 } },
  }],
} satisfies ToolMessage
```

The tool result must follow the assistant tool-call message it answers. Preserve both messages so later turns know what the model requested and what the application returned.

## 5. Attach strict-JSON metadata

Every message role accepts optional metadata:

```ts
const user: UserMessage = {
  role: 'user',
  content: 'Summarize this ticket.',
  metadata: {
    source: 'support-api',
    ticketId: 'TICKET-1042',
    labels: ['billing', 'urgent'],
  },
}
```

Metadata must be a strict JSON value: strings, finite numbers, booleans, null, arrays, and plain objects containing those values. Functions, `undefined`, `BigInt`, dates, sparse arrays, cycles, `NaN`, and infinities are rejected.

Metadata is retained by message, memory, UI, and observability flows, but provider adapters do not treat it as prompt content. Do not put facts there when the model must read them.

Continue with [Content types](/sdk/messages/content).
