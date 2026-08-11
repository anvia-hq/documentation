# Message roles

Every message has one role. The role determines which content types are valid and how provider adapters serialize the transcript.

| Role | Represents | Typical content |
| --- | --- | --- |
| `system` | Stable model behavior. | Instruction text. |
| `user` | Input from a person or application. | Text, images, and documents. |
| `assistant` | Output from the model. | Text, images, reasoning, and tool calls. |
| `tool` | Output produced for a tool call. | Text or structured tool results. |

## Create messages

```ts
import { Message } from '@anvia/core'

const system = Message.system('Answer as a support assistant.')
const user = Message.user('Why did my checkout fail?')
const assistant = Message.assistant('I need the checkout ID to investigate.')
```

All factories accept optional strict-JSON metadata. Assistant messages can also preserve a provider message ID.

```ts
const assistant = Message.assistant(
  'I found the failed checkout.',
  {
    id: 'msg_123',
    metadata: { source: 'support-runner' },
  },
)
```

Message metadata is available to memory and observability, but it is not sent to the provider model as prompt content.

## Keep roles explicit

Documents belong on user messages, reasoning and tool calls belong on assistant messages, and tool results belong on tool messages. Use [content helpers](/sdk/messages/content) instead of constructing ambiguous objects by hand.
