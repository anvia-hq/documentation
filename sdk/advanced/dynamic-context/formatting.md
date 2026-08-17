# Formatting

Formatting converts a vector search result into the `Document` sent to the completion model.

## 1. Understand the default format

Without `format()`, Anvia uses the result ID as the document ID. A string document becomes the text directly; any other document is serialized as indented JSON.

Search metadata is converted to string-valued `additionalProps`. The default is useful when the index stores plain text or a small object whose JSON representation is already clear.

## 2. Format structured records

Use `format()` when titles, dates, sources, or a selected body field need a clearer shape:

```ts
import { Agent, createVectorContext } from '@anvia/core';
type PolicyDocument = {
    title: string;
    body: string;
    updatedAt: string;
};
const policyContext = createVectorContext<PolicyDocument>({
    store: policyIndex,
    model: embeddingModel,
    topK: 3,
    minScore: 0.76,
    format: (result) => ({
        id: `policy:${result.id}`,
        text: [
            `Title: ${result.document.title}`,
            `Updated: ${result.document.updatedAt}`,
            `Source: ${result.metadata?.source ?? 'unknown'}`,
            '',
            result.document.body,
        ].join('\n'),
        additionalProps: {
            source: String(result.metadata?.source ?? 'unknown'),
        },
    })
});
const agent = new Agent({
    id: 'policy-support',
    model,
    instructions: 'Prefer the newest applicable policy and name its source.',
    context: [policyContext],
});
```

The formatter runs after search and before the model request. It changes what the model sees, not the stored vector, metadata, or similarity score.

## 3. Include only useful evidence

A useful model document normally has a stable ID, a recognizable source, relevant version or date information, and the smallest passage containing the evidence.

Avoid repeated navigation, large metadata dumps, unrelated object fields, and boilerplate copied into every result. They consume context and can hide the strongest evidence.

## 4. Keep authorization before formatting

Formatting can omit private fields as defense in depth, but it must not decide whether a result is allowed. Apply permission filters during vector search so an unauthorized record never reaches the formatter.

Test formatters with missing metadata, long bodies, stale revisions, and unexpected stored records. Inspect the exact resulting `Document` when the model ignores or misreads retrieved evidence.

Next, enforce [filters and permissions](/sdk/advanced/dynamic-context/filters).
