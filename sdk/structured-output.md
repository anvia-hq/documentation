# Structured output

Structured output turns a model response into application data that has crossed a local schema-validation boundary.

```text
Model response -> JSON parsing -> Zod validation -> application data
```

A provider may use the schema to guide generation, but product code should trust only the value produced after local validation.

## 1. Define the contract

Anvia uses Zod schemas for parsed completions, agent output schemas, extractors, tool inputs and outputs, and pipeline inputs:

```ts
import { z } from 'zod'

const ticketSchema = z.object({
  category: z.enum(['billing', 'technical', 'account']),
  priority: z.enum(['low', 'normal', 'high']),
  summary: z.string().min(1),
  needsHumanReview: z.boolean(),
})

type Ticket = z.infer<typeof ticketSchema>
```

Keep the schema small, explicit, and aligned with the decision the application needs to make.

## 2. Choose where validation happens

Use `generateCompletion()` when one model call should produce one validated value:

```ts
import { generateCompletion } from '@anvia/core'

const result = await generateCompletion({
    prompt: message,
    model,
    outputSchema: ticketSchema,
    instructions: 'Classify the support request.'
})

console.log(result.output.priority)
```

Use an agent `outputSchema` when tools, retrieval, memory, or multiple turns are needed before the final JSON response. Agent output remains text, so the application must parse and validate it after the run.

Use `extract()` when structured fields already exist in source text and a required submission tool is more appropriate than provider-native output schemas.

## 3. Continue through the section

- [Design portable schemas](/sdk/structured-output/schema-design)
- [Use parsed completion](/sdk/structured-output/parsed-completion)
- [Validate agent output](/sdk/structured-output/agent-output)
- [Extract fields from text](/sdk/structured-output/extractors)
- [Handle validation failures](/sdk/structured-output/validation-errors)
- [Choose the right primitive](/sdk/structured-output/choose-a-primitive)

Use a regular [completion](/sdk/completions) or prose agent response when only a person will read the answer and no application code needs to branch on its fields.
