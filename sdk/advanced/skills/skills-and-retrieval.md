# Skills and retrieval

Skills provide procedural guidance. Retrieval supplies relevant facts from a larger or changing corpus.

## Choose by question

| Need | Use |
| --- | --- |
| Stable behavior for every run | Agent `instructions` option |
| A reusable procedure selected by task | Skills |
| Relevant facts selected by the current prompt | `dynamicContexts` option |
| Optional model-directed factual search | `index.asTool(...)` |
| Live state or an application action | A scoped tool |

Skills answer “how should I perform this task?” Retrieval answers “what information is relevant now?”

## Use skills for procedures

Good skill content includes:

- task sequences and decision rules
- output style and review rubrics
- which reference to consult
- when a deterministic script is useful

Do not place thousands of support articles or frequently changing records in skill references.

## Use retrieval for knowledge

Good retrieval content includes:

- product documentation
- support articles
- policy records
- customer-safe knowledge
- source passages with metadata filters

Retrieval supports chunking, embeddings, relevance thresholds, and permission-aware filters that a skill directory does not replace.

## Combine both

```ts
const supportSkills = await loadSkills(
  skill.local('skills/support-writing'),
)

const agent = new Agent({
  id: 'support',
  model: model,
  instructions: 'Answer accurately and disclose missing evidence.',
  skills: supportSkills,
  dynamicContexts: [{ index: policyIndex, topK: 4, threshold: 0.74, filter: tenantFilter }],
  tools: [createCustomerLookupTool(scope)],
})
```

Here, the skill guides response structure, dynamic context supplies policy facts, and the local tool reads current customer state with product authorization.

## Keep lifecycles separate

Update a skill when the procedure or rubric changes. Re-index retrieval when facts or source documents change. Rebuild a tool when service behavior or product policy changes.

Keeping those concerns separate avoids re-embedding procedural instructions and prevents factual updates from silently changing how the agent performs a task.
