# Choose a primitive

Choose the structured-output primitive from the work the model must perform before producing data.

## Use parsed completion for one direct call

Choose `generateCompletion()` for classification, schema-shaped summaries, routing decisions, and small transformations that fit in one model request.

```ts
const result = await generateCompletion({
    prompt: input,
    model,
    outputSchema: schema
})

return result.output
```

This is the shortest path to locally validated model output, but it requires a model with output-schema support.

## Use agent output after agent work

Choose an agent `outputSchema` when the run needs tools, retrieval, memory, approvals, lifecycle policy, or multiple turns before the final object.

```ts
const agent = new Agent({
  id: 'support',
  model,
  tools,
  outputSchema: supportResultSchema,
})
```

The final agent output remains JSON text. Parse and validate `response.output` after checking that the run completed.

## Use an extractor for fields already in text

Choose `extract()` for invoices, tickets, resumes, transcripts, notes, and other sources whose fields already exist. It uses a required generated `submit` tool and can retry complete extraction attempts.

```ts
const result = await extract({
  model,
  text: invoiceText,
  outputSchema: invoiceSchema,
})

return result.output
```

The model must support tools and required tool choice, but it does not need provider-native output schemas.

## Use tool output schemas at tool boundaries

Use `createTool({ outputSchema })` when application code returns a value to the model and the tool result itself needs local validation:

```ts
const lookupAccount = createTool({
  name: 'lookup_account',
  description: 'Load an account summary.',
  inputSchema: z.object({ accountId: z.string() }),
  outputSchema: z.object({
    plan: z.enum(['free', 'pro', 'enterprise']),
    active: z.boolean(),
  }),
  async execute({ accountId }) {
    return accountRepository.summary(accountId)
  },
})
```

## Use a pipeline for deterministic composition

Choose a [pipeline](/sdk/pipelines) when validation is one stage in a larger typed workflow with deterministic transforms, parallel work, or batch execution.

Use ordinary prose when only a person will read the answer. Adding a schema creates a contract and failure path, so use it where application code genuinely needs structured data.
