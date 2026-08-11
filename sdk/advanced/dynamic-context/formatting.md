# Formatting

Format search results into concise, source-aware documents before they reach the model.

## Default formatting

Without a `format` function, Anvia maps each vector result into a `Document`:

- `id` comes from the search-result ID.
- String documents become document text.
- Non-string documents are serialized as JSON.
- Search metadata becomes string document properties.

The default is enough when the index stores plain text. Use custom formatting when it stores objects or when titles, dates, or sources need a clearer shape.

## Format structured documents

```ts
import { AgentBuilder } from '@anvia/core'

type PolicyDocument = {
  title: string
  body: string
  updatedAt: string
}

const policyContext = {
  topK: 3,
  threshold: 0.76,
  format(result) {
    const policy = result.document as PolicyDocument

    return {
      id: `policy:${result.id}`,
      text: [
        `Title: ${policy.title}`,
        `Updated: ${policy.updatedAt}`,
        `Source: ${result.metadata?.source ?? 'unknown'}`,
        '',
        policy.body,
      ].join('\n'),
    }
  },
} satisfies Parameters<AgentBuilder['dynamicContext']>[1]

const agent = new AgentBuilder('policy-support', model)
  .instructions('Prefer the newest applicable policy and name its source.')
  .dynamicContext(policyIndex, policyContext)
  .build()
```

The formatter runs after search and before the model request. It changes what the model sees; it does not change the stored vector or similarity score.

## Include useful evidence

A good document usually contains:

- a stable ID for debugging
- a short title or source name
- dates or version information when freshness matters
- the smallest passage that contains the answer

Avoid repeating large metadata objects, navigation text, or the same boilerplate in every result. That consumes context without improving the answer.

## Keep authorization outside formatting

Formatting can remove private fields as a final safeguard, but it should not decide whether a result is allowed. Apply permission filters during search so unauthorized documents never reach the formatter.

## Check the final shape

Test the formatter with missing metadata, non-string documents, long bodies, and stale records. If the model ignores retrieved evidence, inspect the exact formatted text before changing the agent instruction.

