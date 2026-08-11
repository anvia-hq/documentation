# Reasoning

Some providers return reasoning content, sources, tool metadata, or generation details. Treat these as operational data rather than automatically user-visible content.

## Reasoning content

```ts
import { AssistantContent, Message } from '@anvia/core'

const assistant = Message.assistant([
  AssistantContent.reasoningSummary(
    'The available evidence points to a payment authorization failure.',
  ),
  AssistantContent.text(
    'The checkout failed while the payment was being authorized.',
  ),
])
```

Assistant helpers also support text reasoning, structured provider content, encrypted blocks, and redacted blocks. Display-safe text is separate from opaque provider reasoning data.

## Generation metadata

Assistant messages created by agent runs can include normalized generation details such as provider, model, usage, context usage, sources, and provider-executed tool calls.

```ts
import { getAssistantGenerationMetadata } from '@anvia/core'

const generation = getAssistantGenerationMetadata(message)

console.log(generation?.provider)
console.log(generation?.model)
console.log(generation?.usage.totalTokens)
```

The helper returns `undefined` for manual, legacy, or malformed messages.

## Decide what to retain

Choose separately what is used for conversation continuity, sent to observability, stored for audit, and shown to users. Raw provider responses, reasoning, tool details, and metadata may contain sensitive information or create unnecessary retention risk.
