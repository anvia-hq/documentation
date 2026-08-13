# Choose a primitive

Choose by what the model and application need to do—not only by the desired schema shape.

| Need | Primitive |
| --- | --- |
| One model call should return one validated object. | `createParsedCompletion(...)` |
| An agent should use tools or context before a structured final answer. | Agent `outputSchema` option |
| Existing content must be converted into fields or records. | `ExtractorBuilder` |
| A tool should return typed data to the model. | Tool `output` schema |
| Multi-step work needs validated input and typed stages. | [Pipeline](/sdk/pipelines) |
| Only a person will read the answer. | Regular completion or agent prose |

## Practical rules

Use parsed completion for direct classification, structured summaries, and small transformations.

Use agent output only when the run needs agent capabilities such as tools, memory, retrieval, approvals, or multiple turns before the final object.

Use an extractor when the content already contains the fields and reliable submission retries matter.

Use a pipeline when structured output is one step in a larger deterministic workflow. Keep validation at every boundary where model text becomes application data.
