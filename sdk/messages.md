# Messages

Messages are Anvia's provider-neutral transcript format. Completions, agents, memory, tools, and UI adapters share the same role and content contracts.

## Explore messages

| Page | Learn how to |
| --- | --- |
| [Message roles](/sdk/messages/roles) | Use system, user, assistant, and tool messages correctly. |
| [Content types](/sdk/messages/content) | Build text, image, document, reasoning, and tool content. |
| [Documents](/sdk/messages/documents) | Attach small documents to messages and completion requests. |
| [Tool call](/sdk/messages/tools) | Preserve the complete tool exchange in history. |
| [Reasoning](/sdk/messages/reasoning) | Handle operational model content and generation details safely. |
| [Transcripts](/sdk/messages/transcripts) | Store and continue complete conversations. |

## The message shape

```ts
import { Message } from '@anvia/core'

const messages = [
  Message.system('Answer clearly and concisely.'),
  Message.user('Summarize this incident.'),
]
```

Use the factory helpers to create valid content arrays and metadata. Provider adapters translate these normalized messages into their native API formats.

Check the selected [completion model](/sdk/models/completion) before sending images, documents, tools, reasoning, or other optional content.
