# Context

Context supplies facts an agent may use. Choose the context path based on how large, dynamic, and permission-sensitive those facts are.

## Static context

Use `.context(text, id)` for small documents that are safe and useful for every run of the agent.

```ts
const agent = new AgentBuilder('release-notes', model)
  .instructions('Answer questions about the current release.')
  .context(currentReleaseNotes, 'release-notes')
  .context(supportPolicySummary, 'support-policy')
  .build()
```

Static context is sent with every model request. Keep it short and stable.

## Dynamic context

Use retrieval when relevant documents should be selected for each turn:

```ts
import { vectorFilter } from '@anvia/core/vector-store'

const agent = new AgentBuilder('docs-support', model)
  .instructions('Use retrieved documentation before answering.')
  .dynamicContext(docsIndex, {
    topK: 5,
    threshold: 0.72,
    filter: vectorFilter.eq('product', 'platform'),
  })
  .build()
```

Enforce tenant, product, language, and access filters in the index or retrieval adapter. Prompt instructions must not be the authorization boundary.

## Request context

Keep user, tenant, conversation, and trace data on the request boundary:

```ts
const response = await agent
  .session(conversationId, {
    userId: user.id,
    metadata: { tenantId: user.tenantId },
  })
  .prompt(input.message)
  .withTrace({
    name: 'support-chat',
    userId: user.id,
  })
  .send()
```

| Context | Best location |
| --- | --- |
| Small facts safe for all callers | `.context(...)` |
| Large or changing knowledge | `.dynamicContext(...)` |
| Conversation identity | `.session(...)` |
| Observability metadata | `.withTrace(...)` |
| Permissioned product state | Scoped tools and services |

See [Knowledges](/sdk/knowledges) for ingestion, indexes, and retrieval patterns.
