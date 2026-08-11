# Knowledge

Studio's Knowledge workspace explains what information and dynamically selected capabilities an agent can receive. It combines configuration inspection with trace-backed evidence, so you can distinguish what is registered from what a model actually saw during a run.

Open `http://localhost:4021/ui/knowledge`. Studio starts on **Static Context** and provides separate views for **Dynamic Context**, **Dynamic Tools**, and **Retrieval Log**.

![Studio Knowledge inspector showing dynamic context documents](/images/studio/knowledge-inspector.png)

::: info Knowledge is read-only
Studio browses registered sources and recorded generation inputs. It does not add, edit, remove, embed, or re-index documents and tools. Keep ingestion and index maintenance in application code or background workflows.
:::

## Choose the right view

| Question | View |
| --- | --- |
| What short, always-available documents are configured? | [Static context](/studio/knowledge/static-context) |
| What chunks can this registered index expose? | [Dynamic context](/studio/knowledge/dynamic-context) |
| Which tool definitions are stored in the dynamic index? | [Dynamic tools](/studio/knowledge/dynamic-tools) |
| What documents and tools reached a recorded model generation? | [Retrieval evidence](/studio/knowledge/retrieval-evidence) |

The first three views inspect configuration or browseable source contents. They do not prove that a particular item reached the model. The Retrieval Log is the evidence view for a specific recorded generation.

## A complete inspectable agent

```ts
const agent = new AgentBuilder('knowledge-ops', model)
  .instructions('Use the available operational knowledge and tools.')
  .context(
    'Escalate blocked enterprise orders to the support lead.',
    'enterprise-escalation',
  )
  .dynamicContext(knowledgeIndex, {
    topK: 3,
    threshold: 0.7,
  })
  .dynamicTools(toolIndex, {
    topK: 2,
    threshold: 0.75,
  })
  .build()

new Studio([agent]).start({ port: 4021 })
```

Studio enables the Knowledge workspace when at least one registered agent has static context, dynamic context, or dynamic tools. If several agents or indexes are present, source selectors keep their contents separate.

For document ingestion, embeddings, and vector stores, start with [Anvia SDK Knowledges](/sdk/knowledges). For retrieval behavior and policy, see [Dynamic context](/sdk/advanced/dynamic-context) and [Dynamic tools](/sdk/advanced/dynamic-tools).

## A practical debugging loop

1. Browse the relevant source to confirm the expected item exists and is inspectable.
2. Run a representative prompt in the [Playground](/studio/playground).
3. Open **Retrieval Log** and find the generation for that prompt.
4. Compare its documents and tool names with the expected source contents.
5. Open the linked trace when you need the complete generation input, output, timing, and metadata.

If an item exists in the source but is absent from the generation, investigate the query text, embeddings, `topK`, threshold, and metadata filter. If the correct item reached the generation but the answer is wrong, inspect the prompt and model response rather than changing ingestion first.
