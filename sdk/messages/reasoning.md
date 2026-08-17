# Reasoning

Some providers return reasoning text, summaries, signatures, encrypted data, or redacted placeholders alongside visible assistant text. Treat reasoning as operational model content, not as automatically user-visible output.

## 1. Create simple reasoning content

```ts
import type { AssistantMessage } from '@anvia/core'

const assistant: AssistantMessage = {
  role: 'assistant',
  content: [
    {
      type: 'reasoning',
      id: 'reasoning_123',
      text: 'The payment provider rejected the authorization.',
    },
    { type: 'text', text: 'The checkout failed while the payment was being authorized.' },
  ],
}
```

The optional ID can be important when a provider expects reasoning state to be preserved in later history.

## 2. Preserve structured provider reasoning

Preserve provider reasoning representations in `details`:

```ts
const reasoning: ReasoningPart = {
  type: 'reasoning',
  id: 'reasoning_123',
  text: 'Checked the payment evidence.Authorization failed.',
  details: [
    { type: 'summary', text: 'Checked the payment evidence.' },
    { type: 'encrypted', data: encryptedReasoning },
    { type: 'text', text: 'Authorization failed.', signature: 'sig_123' },
    { type: 'redacted', data: redactedMarker },
  ],
}
```

The reasoning object's `text` field contains only displayable `text` and `summary` values. Encrypted and redacted data stays opaque.

## 3. Keep visible output separate

`generateCompletion().text` and an agent's final `output` are built from assistant `text` blocks, not reasoning blocks:

```ts
const result = await generateCompletion({
    prompt: 'Explain the incident.',
    model
})

console.log(result.text)

for (const item of result.content) {
  if (item.type === 'reasoning') {
    console.log(item.text)
  }
}
```

This separation lets an application render the answer without accidentally exposing operational reasoning. Decide deliberately whether summaries are safe for a specific internal interface.

## 4. Handle reasoning streams

Streaming models can emit `reasoning_delta` events with an ID, content type, and optional signature:

```ts
for await (const event of agent.stream({
    prompt: input
})) {
  if (event.type === 'reasoning_delta') {
    recordReasoningDelta({
      id: event.id,
      type: event.contentType,
      delta: event.delta,
      signature: event.signature,
    })
  }
}
```

Encrypted or redacted deltas may contain opaque data rather than display text. Filter them before client transport and preserve them only when provider continuity or an explicit audit policy requires it.

## 5. Read generation metadata

Assistant messages created by agent runs include normalized generation metadata:

```ts
import { getAssistantGenerationMetadata } from '@anvia/core'

const generation = getAssistantGenerationMetadata(message)

console.log(generation?.provider)
console.log(generation?.modelId)
console.log(generation?.usage.totalTokens)
console.log(generation?.contextUsage)
console.log(generation?.sources)
console.log(generation?.providerToolCalls)
```

The helper returns `undefined` for non-assistant messages and for missing or malformed framework metadata.

Choose separately what is retained for conversation continuity, sent to observability, stored for audit, and shown to users. Reasoning, tool details, sources, and provider metadata may contain sensitive information.

Continue with [Transcripts](/sdk/messages/transcripts).
