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

`context` accepts three kinds of entry: a static `Document`, a `VectorContext` from `createVectorContext()` or
`createVectorIndex().asContext()`, and a `ContextSource` from `createContextSource()` for application-owned
retrieval. Mix them in one array when an agent needs stable instructions plus retrieved material.

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

Passing the `session` run option to `generate()` or `stream()` on an agent without configured memory throws `TypeError: Agent "X" cannot use a session without a memory store.` See [Memory sessions](/sdk/memory/sessions) for configuration and lifecycle.

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

When a run uses a memory session, `sessionId` and `userId` reach observers even if `trace` omits them; explicit
`trace` fields win field by field. Session identity therefore enters configured telemetry, so review exporter
destinations and redaction when those identifiers are sensitive. Observers still must not use them for
authorization.

## 5. Account for input tokens

`@anvia/core/context` estimates how a request's input tokens are spent, without another model call:

```ts anvia-check context-breakdown-example
import { estimateContextBreakdown, scaleContextBreakdown } from '@anvia/core/context'

const breakdown = estimateContextBreakdown({
  instructions: 'Answer briefly and cite the policy.',
  chatHistory: [{ role: 'user', content: 'Where is my order?' }],
  documents: [{ id: 'shipping-policy', text: 'Orders ship within two business days.' }],
  tools: [],
})

console.log(breakdown.estimatedTokens)
for (const segment of breakdown.segments) {
  console.log(segment.id, segment.tokens, segment.characters, segment.items)
}

// Once the provider reports usage, keep the local split but adopt its total.
const exact = scaleContextBreakdown(breakdown, 1_234)
```

The nine segments, in order, are `instructions`, `skills`, `messages`, `toolResults`, `documents`,
`tools`, `mcpTools`, `providerTools`, and `outputSchema`; `CONTEXT_SEGMENT_IDS` lists that order. The
`skills` segment combines skill catalog instructions, skill tool definitions, and loaded skill tool
results, which `Agent` detects automatically from the tools it was given. `estimateContextTextTokens()`
is the default provider-neutral counter (about four characters per token); pass `tokenCounter` for a
model-specific estimate, and `mcpToolNames` to report MCP-served tools separately. Direct callers can attribute skills themselves with `skillInstructions` (the catalog text appended to `instructions`) and `skillToolNames`. Inline base64 media
counts as at most 8,000 characters because providers bill media by pixels or duration rather than
payload bytes. Estimates are local, and although the provider's input count may include fields this
split does not model, `scaleContextBreakdown()` keeps the proportions and makes the segments add up to
the reported total. `isContextBreakdown(value)` narrows an unknown value.

A completed agent outcome also exposes the scaled breakdown:

```ts
if (result.type === 'response' && result.contextBreakdown !== undefined) {
  for (const segment of result.contextBreakdown.segments) {
    console.log(segment.id, segment.tokens)
  }
}
```

Agent observers receive the same structure on generation start and scaled on end through
`args.context`, streaming runs report it on `turn_end`, and `@anvia/client` forwards it on
`message_end`, `turn_end`, and `run_end` frames and on `UIMessage.generation`. A failed generation
carries the estimate. This is observability data, not authoritative billing. Structured-output retries
report the final attempt's input tokens rather than cumulative retry usage. Durable runs persist
requests, not these breakdowns.

Continue with [Per-run controls](/sdk/agents/per-run-controls).
