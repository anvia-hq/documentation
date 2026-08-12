# Structured output

**Type:** Recipe

## Outcome

Build a command-line ticket classifier that returns a TypeScript-typed object only after the
model's JSON has passed a Zod schema.

- **Difficulty:** Beginner
- **Estimated time:** 15 minutes

## Prerequisites

- Node.js 22 or newer
- pnpm 11 or newer
- An OpenAI API key with access to `gpt-5`
- Basic familiarity with Zod schemas

## Packages used

- `@anvia/core` for `createParsedCompletion(...)`
- `@anvia/openai` for the OpenAI completion model
- `zod` for the application data contract and runtime validation
- `tsx`, TypeScript, and Node.js types for running the TypeScript file

## Installation and environment setup

From an empty project directory, install the runtime and development packages:

```bash
pnpm init
pnpm pkg set type=module
pnpm add @anvia/core @anvia/openai zod
pnpm add --save-dev tsx typescript @types/node
```

Set the API key in the shell that will run the example:

```bash
export OPENAI_API_KEY=your_api_key
```

## Complete example

Save this as `structured-output.ts`:

```ts
import { createParsedCompletion } from '@anvia/core'
import { OpenAIClient } from '@anvia/openai'
import { z } from 'zod'

const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Set OPENAI_API_KEY before running this example.')
}

const ticketSchema = z.object({
  customer: z.string().min(1),
  priority: z.enum(['low', 'normal', 'high']),
  summary: z.string().min(1),
})

const openai = new OpenAIClient({ apiKey })
const model = openai.completionModel('gpt-5')

const result = await createParsedCompletion(model, {
  schema: ticketSchema,
  instructions: 'Classify the support ticket using only facts stated in the message.',
  input: `Customer: Acme Co.
Priority: high
Message: Checkout requests have failed for the last 20 minutes.`,
})

console.log(JSON.stringify(result.data, null, 2))
```

## Run it

```bash
pnpm tsx structured-output.ts
```

## Expected behavior

The program prints a validated JSON object with `customer`, `priority`, and `summary` fields. For
this prompt, the model should preserve the stated `Acme Co.` customer and `high` priority; the
summary wording can vary. If the provider returns invalid JSON or data that does not satisfy the
schema, the call rejects instead of returning unvalidated `data`.

## How it works

`createParsedCompletion(...)` converts the Zod schema to the provider's output-schema format, makes
one model call, parses the returned text as JSON, and validates it with the same schema. The type of
`result.data` is inferred from `ticketSchema`. The result also includes the normalized text,
content, usage, and provider response, but application code should use `data` after validation.

Use this primitive when one model request should produce one object. Use an agent output schema when
tools, memory, retrieval, hooks, or several turns must run before the structured final result.

## Production and security notes

- A schema proves shape, not truth. Recheck identifiers, permissions, and business invariants before
  using fields for writes, billing, access decisions, or other side effects.
- Treat schema failures as expected workflow failures. Route them to a safe retry, review, or
  rejection state; do not fall back to trusting `result.text`.
- Keep schemas narrow and test them with the exact provider and model used in production. Advanced
  schema features and structured-output fidelity can vary by provider.
- Keep API keys server-side and avoid logging prompts or raw provider responses when they may
  contain sensitive ticket content.

## Next steps

- [Design structured-output schemas](/sdk/structured-output/schema-design)
- [Handle validation errors](/sdk/structured-output/validation-errors)
- [Choose a structured-output primitive](/sdk/structured-output/choose-a-primitive)
- [Return structured output from an agent](/sdk/structured-output/agent-output)

## Source and extensions

Compare the runnable
[structured extraction](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/03_structured_output/01-structured-extraction.ts)
and
[agent output schema](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/03_structured_output/02-output-schema.ts)
examples. Next, add a review queue for validation failures or feed the validated object into a
pipeline.
