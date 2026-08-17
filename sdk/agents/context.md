# Context

Context supplies facts an agent may use while instructions define how the agent should behave. In v1, the `context` array accepts both static documents and retrieval-backed context indexes.

## 1. Add static documents

Use static context for small facts that are safe and useful on every run:

```ts
import { Agent } from '@anvia/core'

const supportPolicy = {
  id: 'support-policy',
  text: [
    'Enterprise incidents receive 24-hour support.',
    'Security incidents must be escalated to the incident commander.',
  ].join('\n'),
  additionalProps: { source: 'internal-policy' },
}

const supportAgent = new Agent({
  id: 'support',
  model,
  instructions: 'Use the supplied policy when it is relevant.',
  context: [supportPolicy],
})
```

Static documents are sent with every model turn. Keep them short, stable, and free of caller-specific secrets.

## 2. Retrieve context for each turn

Use `createVectorContext()` when only relevant documents should be selected from a larger collection:

```ts
import { Agent, createVectorContext } from '@anvia/core';
import { vectorFilter } from '@anvia/core/vector-store';
function createDocsAgent(tenantId: string) {
    const docsContext = createVectorContext({
        store: docsIndex,
        model: embeddingModel,
        topK: 5,
        minScore: 0.72,
        filter: vectorFilter.eq('tenantId', tenantId)
    });
    return new Agent({
        id: 'docs-support',
        model,
        instructions: 'Answer from retrieved documentation. Say when context is insufficient.',
        context: [docsContext],
    });
}
const docsAgent = createDocsAgent(user.tenantId);
```

Before each model turn, Anvia searches the context index using text from the current prompt. Tool results and steering messages can therefore change what is retrieved on a later turn.

`topK` must be positive. `minScore` is optional. Use the store filter to enforce tenant, product, language, or access boundaries before a document reaches the model.

See [Knowledges](/sdk/knowledges) for loading documents, embeddings, vector stores, filters, and retrieval patterns.

## 3. Use a memory session for conversation identity

An agent with a memory store can create a named session:

```ts
const sessionAgent = new Agent({
    id: 'support-session',
    model,
    instructions: 'Keep answers consistent with the conversation history.',
    memory: { store: memoryStore },
});
const session = { sessionId: conversationId, userId: user.id, metadata: { tenantId: user.tenantId } };
const result = await sessionAgent.generate({
    prompt: input.message,
    session: session
});
```

The session ID scopes stored conversation history. `userId` and JSON `metadata` are passed to the memory store as part of the conversation context. They do not replace authorization inside tools or retrieval.

Calling `session()` on an agent without configured memory throws. See [Memory sessions](/sdk/memory/sessions) for configuration and lifecycle.

## 4. Attach observability context per run

Use the run-level `trace` option for correlation data that belongs to one request:

```ts
const result = await docsAgent.generate({
    prompt: input.message,
    trace: {
        name: 'docs-support',
        userId: user.id,
        sessionId: conversationId,
        metadata: { tenantId: user.tenantId },
        tags: ['support', 'docs'],
    }
})
```

Trace metadata is for observability. It does not automatically become model context and must not be treated as a permission check.

Continue with [Per-run controls](/sdk/agents/per-run-controls).
