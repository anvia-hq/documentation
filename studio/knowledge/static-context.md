# Static context

The Static Context view lists the small documents configured directly on each Studio agent. These documents are always available to that agent; no similarity search decides whether they are included.

Open `http://localhost:4021/ui/knowledge/static-context`.

## Add static context

```ts
const agent = new AgentBuilder('support-agent', model)
  .instructions('Use the support policy when it applies.')
  .context(
    [
      'Enterprise escalation policy',
      'Blocked enterprise orders require a support lead summary.',
      'Confirm an engineering owner before making customer commitments.',
    ].join('\n'),
    'enterprise-escalation',
  )
  .build()
```

The second `.context(...)` argument is the document ID. Give it a stable, descriptive value: Studio displays that ID beside the text, and it is more useful in debugging than an automatically generated name such as `static_doc_0`.

## What the view proves

For each registered agent, Studio lets you browse its static document IDs and text. With large lists, items are loaded in pages through **Load more**.

Use this view to check that:

- the intended policy or fact was attached to the right agent;
- its text is current and complete;
- IDs remain stable and recognizable;
- unrelated or sensitive material was not included accidentally.

This is configuration inspection, not an editor. Change the `.context(...)` calls in application code and restart the Studio process to publish a different set.

## Keep static context deliberate

Static context is best for short facts that are safe and useful on every run. It is a poor fit for a large corpus, frequently changing records, or tenant-specific material.

| Material | Better mechanism |
| --- | --- |
| Short global policy | Static `.context(...)` |
| Large searchable documentation | [Dynamic context](/studio/knowledge/dynamic-context) |
| Current account or order state | A scoped tool |
| User and tenant identity | Request/session context |

Run a prompt after checking the configured document, then use [Retrieval evidence](/studio/knowledge/retrieval-evidence) to confirm which documents were present on the recorded generation. See [SDK agent context](/sdk/agents/context) for the broader context design boundary.
