# Embedding text

Embedding text determines which prompts retrieve a tool. It should describe the capability accurately in the language users and agents are likely to use.

## Default text

By default, `createToolIndex(...)` embeds each tool's:

- name
- description
- JSON parameters

Clear tool definitions are therefore the first retrieval improvement. Fix vague names and descriptions before adding custom search terms.

## Customize the content

```ts
const toolIndex = await createToolIndex(
  embeddingModel,
  tools,
  {
    content(_tool, definition) {
      return [
        definition.name,
        definition.description,
        JSON.stringify(definition.parameters),
        'Use for refunds, credits, invoice adjustments, and payment disputes.',
      ]
    },
  },
)
```

`content(...)` may return one string or an array of strings. Include useful synonyms, product language, and concrete intents that genuinely match the tool.

## Describe when to use the tool

Weak:

```text
Manage billing.
```

Stronger:

```text
Request a refund for an eligible paid order after validating the amount and reason.
```

The stronger description identifies the action, target, and relevant conditions without promising permissions the tool does not have.

## Keep metadata separate

Embedding text controls semantic relevance. Metadata controls eligibility.

```ts
const toolIndex = await createToolIndex(embeddingModel, tools, {
  content: (_tool, definition) => [
    definition.name,
    definition.description,
  ],
  metadata: (tool) => ({
    tenantId: scope.tenantId,
    role: scope.role,
    risk: tool.name.includes('refund') ? 'high' : 'normal',
  }),
})
```

Do not place tenant IDs or permissions only in embedding text. Enforce them with filters and inside the tool handler.

## Avoid keyword stuffing

Do not add unrelated terms merely to force a tool into more result sets. That makes selection less predictable and exposes capabilities to prompts they do not serve.

Evaluate real user phrases, ambiguous requests, and negative examples. Retrieval quality should be measured by whether the correct tool is selected—and whether irrelevant tools stay hidden.
