# Content types

Anvia models message content as discriminated blocks instead of assuming every message contains plain text. Check each block's `type` before reading its fields.

## 1. Build user content

`UserMessage.content` supports text, image, and file parts:

```ts
import type { UserMessage } from '@anvia/core'

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Summarize the attached incident report and chart.' },
    {
      type: 'image',
      image: { type: 'url', url: 'https://files.example.com/error-rate.png' },
      detail: 'high',
    },
    {
      type: 'file',
      data: { type: 'url', url: 'https://files.example.com/incident.pdf' },
      mediaType: 'application/pdf',
      filename: 'incident.pdf',
    },
  ],
}
```

Use `{ type: 'data', data: base64 }` when the application already has encoded bytes. Do not include a data-URL prefix unless a provider adapter explicitly requires it. Already extracted text is an ordinary `{ type: 'text', text }` part.

## 2. Build assistant content

`AssistantMessage.content` supports text, images, reasoning, and tool calls:

```ts
import type { AssistantMessage } from '@anvia/core'

const response: AssistantMessage = {
  role: 'assistant',
  content: [
    {
      type: 'reasoning',
      text: 'The payment provider rejected the authorization.',
      details: [{ type: 'summary', text: 'The payment provider rejected the authorization.' }],
    },
    { type: 'text', text: 'The checkout failed during payment authorization.' },
    {
      type: 'tool-call',
      toolCallId: 'tool_123',
      callId: 'call_123',
      toolName: 'get_payment_status',
      input: { checkoutId: 'checkout_456' },
    },
  ],
}
```

Image helpers are available on assistant content too, although not every provider accepts assistant images when that message is sent back as history.

## 3. Build tool content

One tool message may contain several normalized tool results:

```ts
import type { ToolMessage } from '@anvia/core'

const toolMessage: ToolMessage = {
  role: 'tool',
  content: [
    {
      type: 'tool-result',
      toolCallId: 'tool_1',
      toolName: 'get_invoice',
      output: { type: 'text', value: 'Invoice inv_123 is paid.' },
    },
    {
      type: 'tool-result',
      toolCallId: 'tool_2',
      toolName: 'get_receipt',
      output: {
        type: 'content',
        value: [
          { type: 'text', text: 'The receipt image follows.' },
          {
            type: 'file',
            data: { type: 'data', data: receiptBase64 },
            mediaType: 'image/png',
          },
        ],
      },
    },
  ],
}
```

Tool-result content supports text and base64 image blocks. Adapter support for image tool results varies.

## 4. Inspect blocks safely

```ts
for (const item of completion.content) {
  switch (item.type) {
    case 'text':
      console.log(item.text)
      break
    case 'reasoning':
      console.log(item.text)
      break
    case 'tool-call':
      console.log(item.toolName, item.input)
      break
    case 'image':
      console.log(item.image.type)
      break
  }
}
```

Use [completion model capabilities](/sdk/models/completion) to reject unsupported image, file-document, tool, schema, or reasoning requests before provider execution. Then validate the exact provider model's media types, sizes, and account restrictions.

Continue with [Documents](/sdk/messages/documents).
