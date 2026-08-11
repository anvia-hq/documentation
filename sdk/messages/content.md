# Content types

Anvia models message content as typed blocks instead of assuming every message contains plain text.

## User content

```ts
import { Message, UserContent } from '@anvia/core'

const prompt = Message.user([
  UserContent.text('Summarize the attached incident report.'),
  UserContent.imageUrl('https://files.example.com/chart.png'),
  UserContent.documentUrl(
    'https://files.example.com/incident.txt',
    'text/plain',
    { filename: 'incident.txt' },
  ),
])
```

User content supports text, image URLs, base64 images, document URLs, base64 documents, and document text.

## Assistant content

```ts
import { AssistantContent, Message } from '@anvia/core'

const response = Message.assistant([
  AssistantContent.text('The checkout failed during payment authorization.'),
  AssistantContent.reasoningSummary('The payment provider rejected the request.'),
])
```

Assistant content supports text, images, reasoning content, and tool calls.

## Tool content

Tool messages contain results for an assistant tool call. Prefer `Message.toolResult(...)` for the common case; it handles strings, JSON-serializable values, and structured text or image results.

## Check model support

A model that supports image input may not support documents, tools, schemas, or the same media limits. Validate each requested capability against the exact provider model ID.
