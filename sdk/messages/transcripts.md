# Transcripts

A transcript is a non-empty ordered sequence of system, user, assistant, and tool messages. Preserve the complete sequence when a later model call must understand what happened earlier.

## 1. Continue a direct completion

Append the next user message, pass the full array as the first argument, then store the normalized assistant response:

```ts
import { generateCompletion, type Message } from '@anvia/core'

const transcript = [
  { role: 'system', content: 'Answer as a concise support assistant.' },
  { role: 'user', content: 'My checkout ID is checkout_123.' },
  { role: 'assistant', content: 'What problem occurred during checkout?' },
  { role: 'user', content: 'The payment was declined.' },
] satisfies Message[]

const result = await generateCompletion({
    messages: transcript,
    model
})

const updatedTranscript = [
  ...transcript,
  {
    role: 'assistant',
    content: result.content,
    ...(result.messageId ? { id: result.messageId } : {}),
  },
]
```

Direct completions do not persist history. The application owns `updatedTranscript`, retention, deletion, and the next message appended to it.

If the assistant content contains a tool call, append the matching tool-result message before asking the model to continue. Do not reduce a tool exchange to visible text.

## 2. Pass a transcript to an agent

A direct agent also accepts `Message[]`:

```ts
const result = await supportAgent.generate({
    messages: [
        { role: 'user', content: 'My project is named Anvia.' },
        { role: 'assistant', content: 'I will remember that for this run.' },
        { role: 'user', content: 'What is my project named?' },
    ]
})
```

The last message becomes the active prompt and all earlier messages become history. The result's `messages` field contains messages created during this run, beginning with the active prompt; it does not repeat the preceding input history.

Use this form when application code intentionally manages the transcript. Use a memory session when Anvia should load and append conversation history automatically.

## 3. Use persisted session memory

```ts
import { Agent, type MemoryScope } from '@anvia/core'

const memoryAgent = new Agent({
  id: 'support-memory',
  model,
  instructions: 'Use conversation history when answering follow-ups.',
  memory: { store: memoryStore },
})

const session = {
  sessionId: 'thread_123',
  userId: 'user_456',
  metadata: { tenantId: 'tenant_789' },
} satisfies MemoryScope

await memoryAgent.generate({
  prompt: 'My checkout ID is checkout_123.',
  session,
})
const result = await memoryAgent.generate({
  prompt: 'Which checkout did I mention?',
  session,
})

const storedMessages = await memoryStore.load({ scope: session })
```

Anvia loads prior messages and saves new runtime messages according to the configured [memory save policy](/sdk/memory/save-policies). Clear a conversation through `memoryStore.clear({ scope: session })`.

## 4. Preserve enough context

Keep:

- role and message order;
- every assistant content block, not only visible text;
- tool-call and matching tool-result IDs;
- provider message and call IDs when present;
- reasoning identifiers or opaque continuity data required by the provider; and
- strict-JSON metadata used by memory, UI, or observability.

Your application still owns tenant checks, authorization, retention periods, deletion, redaction, encryption, and audit policy. Conversation memory is not a substitute for product authorization.
