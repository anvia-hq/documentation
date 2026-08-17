# Skills and retrieval

Skills provide procedural guidance. Retrieval supplies relevant facts from a larger or changing corpus.

Use stable agent `instructions` for behavior required on every run.

Use skills for reusable procedures selected by task.

Use `createVectorContext()` for facts selected automatically from the current prompt.

Use `createVectorSearchTool()` for optional, model-directed factual search.

Use scoped tools for live state and application actions.

## 1. Use skills for procedures

Good skill content includes task sequences, decision rules, output rubrics, directed references, and reviewed deterministic helpers.

Do not place thousands of articles or frequently changing records in skill references.

## 2. Use retrieval for knowledge

Good retrieval content includes product documentation, support articles, policy records, and source passages with permission metadata.

Retrieval adds chunking, embeddings, relevance thresholds, and metadata filters that a skill directory does not replace.

## 3. Combine both boundaries

```ts
import { Agent, createVectorContext } from '@anvia/core';
import { loadSkills, skill } from '@anvia/core/skills';
const supportSkills = await loadSkills(skill.local('skills/support-writing'));
const policyContext = createVectorContext({
    store: policyIndex,
    model: embeddingModel,
    topK: 4,
    minScore: 0.74,
    filter: tenantFilter
});
const agent = new Agent({
    id: 'support',
    model,
    instructions: 'Answer accurately and disclose missing evidence.',
    skills: supportSkills,
    context: [policyContext],
    tools: [createCustomerLookupTool(scope)],
});
```

The skill guides response procedure, the vector context supplies policy facts, and the local tool reads current customer state with product authorization.

## 4. Keep update lifecycles separate

Update a skill when the procedure or rubric changes. Re-index retrieval when facts or source documents change. Update a tool when service behavior or product policy changes.

This avoids re-embedding procedural instructions and prevents factual changes from silently redefining how the agent performs its job.
