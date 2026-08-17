# Embedding text

Embedding text determines which prompts retrieve a tool. Describe the capability in the language users are likely to use, without implying permissions the tool does not have.

## 1. Start with the default

By default, `embedTools()` and `createToolIndex()` embed three parts of each resolved definition:

- name
- description
- JSON parameters

Clear tool names, descriptions, and input schemas are therefore the first retrieval improvement.

## 2. Add precise domain language

```ts
import { createToolIndex } from '@anvia/core/tool';
const billingIndex = await createToolIndex({
    model: embeddingModel,
    tools: billingTools,
    topK: 5,
    minScore: 0.72,
    content: (_tool, definition) => [
        definition.name,
        definition.description,
        JSON.stringify(definition.parameters),
        'Refunds, credits, invoice adjustments, and payment disputes.',
    ]
});
```

`content()` may return one string or several strings. Multiple strings are embedded as parts of the same tool record and retained as newline-separated document text.

Useful additions include product terminology, common synonyms, and concrete user intents that genuinely match the operation.

## 3. Describe one actionable capability

Weak text:

```text
Manage billing.
```

Stronger text:

```text
Request a refund for an eligible paid order after validating the amount and reason.
```

The stronger version identifies the action, target, and conditions. It is easier to distinguish from invoice lookup, credit creation, or dispute review.

## 4. Keep eligibility in metadata

```ts
import { vectorFilter } from '@anvia/core/vector-store';
const billingIndex = await createToolIndex({
    model: embeddingModel,
    tools: billingTools,
    topK: 5,
    content: (_tool, definition) => [
        definition.name,
        definition.description,
    ],
    metadata: (tool) => ({
        plan: scope.plan,
        risk: tool.name.includes('refund') ? 'high' : 'normal',
    }),
    filter: vectorFilter.eq('plan', scope.plan)
});
```

Embedding text controls semantic relevance. Metadata filters control eligibility before exposure. The tool handler must still enforce the real authorization boundary at execution time.

## 5. Evaluate positive and negative examples

Test common wording, domain synonyms, ambiguous prompts, and unrelated requests. Tune `topK` and minScore using measured selection results rather than keyword stuffing.

Next, combine [static and dynamic tools](/sdk/advanced/dynamic-tools/static-and-dynamic).
