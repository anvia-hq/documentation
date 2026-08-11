# Which structured-output primitive should I use?

Choose based on the workflow before the object is produced.

| Need | Primitive |
| --- | --- |
| One model call returns one validated object | [`createParsedCompletion(...)`](/sdk/structured-output/parsed-completion) |
| An agent uses tools, memory, or retrieval first | [Agent output schema](/sdk/structured-output/agent-output) |
| Existing content must be converted into fields | [Extractor](/sdk/structured-output/extractors) |
| A tool returns typed data to the model | Tool `output` schema |
| Typed data is one stage in a larger workflow | [Pipeline](/sdk/pipelines) |

## Does a schema guarantee valid model output?

No. It defines the requested shape and the application validation boundary. Provider output-schema support varies, and a model can still produce invalid JSON or data that fails validation. Handle the documented errors instead of trusting unvalidated text.

```ts
import { createParsedCompletion } from '@anvia/core'
import { z } from 'zod'

const result = await createParsedCompletion(model, {
  schema: z.object({ priority: z.enum(['low', 'high']) }),
  input: 'Checkout is unavailable for all customers.',
})

console.log(result.data.priority)
```

## Should I parse `result.text` myself after validation fails?

No. That bypasses the schema boundary. Return a controlled failure, retry only under an explicit policy, or route the input for review.

Check the exact model's schema support in the [provider capability matrix](/sdk/providers/capability-matrix), then follow [Schema design](/sdk/structured-output/schema-design) and [Validation errors](/sdk/structured-output/validation-errors).
