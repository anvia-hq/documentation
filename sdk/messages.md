# Messages

Messages are Anvia's provider-neutral transcript format. Direct completions, agents, memory stores, tools, guardrails, observers, and UI adapters use the same roles and typed content blocks.

Provider adapters translate these normalized messages into their native request formats and translate provider responses back into normalized assistant content.

## 1. Create a transcript

Messages are strict JSON-safe objects. Use the exported types for authoring and `parseMessages()` at untrusted boundaries:

```ts
import { parseMessages, type Message } from '@anvia/core'

const transcript = [
  { role: 'system', content: 'Answer clearly and state uncertainty.' },
  { role: 'user', content: 'Summarize this incident for the support team.' },
] satisfies Message[]

const validated = parseMessages(JSON.parse(requestBody))
```

Each role has a fixed content shape. Optional metadata must also be strict JSON.

## 2. Send the transcript

The same `Message[]` can be passed to a direct completion or an agent:

```ts
const completion = await generateCompletion({
    messages: transcript,
    model
})

const agentResult = await incidentAgent.generate({
    messages: transcript
})
```

A direct completion or stateless agent sends the entire array as chat history. A memory-backed run instead uses `{ prompt, session }`; persisted sessions and caller-owned transcripts are mutually exclusive.

## 3. Use discriminated content parts

User content arrays contain `text`, `image`, and `file` parts. Their discriminants keep provider-neutral media explicit:

```ts
import type { UserMessage } from '@anvia/core'

const prompt: UserMessage = {
  role: 'user',
  content: [
    { type: 'text', text: 'Describe the attached diagram.' },
    {
      type: 'image',
      image: { type: 'url', url: 'https://files.example.com/architecture.png' },
    },
  ],
}
```

Anvia validates optional capabilities such as image input and file-document input before calling the provider. The adapter capability is still only the first check: the exact provider model, account, file type, and size limit must also support the request.

## Explore messages

- [Message roles](/sdk/messages/roles) explains system, user, assistant, and tool messages.
- [Content types](/sdk/messages/content) builds text, image, document, reasoning, and tool blocks.
- [Documents](/sdk/messages/documents) separates tagged text context from file attachments.
- [Tool call](/sdk/messages/tools) preserves a complete tool exchange.
- [Reasoning](/sdk/messages/reasoning) handles display text, opaque provider content, and generation metadata.
- [Transcripts](/sdk/messages/transcripts) continues and persists ordered conversations.

Continue with [Message roles](/sdk/messages/roles).
