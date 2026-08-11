# Structured output

Structured output turns model text into schema-validated application data.

## Explore structured output

| Page | Learn how to |
| --- | --- |
| [Schema design](/sdk/structured-output/schema-design) | Define narrow, portable Zod contracts. |
| [Parsed completion](/sdk/structured-output/parsed-completion) | Return validated data from one model call. |
| [Agent output](/sdk/structured-output/agent-output) | End a tool-using or contextual run with a schema-shaped result. |
| [Extractors](/sdk/structured-output/extractors) | Pull typed fields from existing content. |
| [Validation errors](/sdk/structured-output/validation-errors) | Handle malformed JSON and schema failures safely. |
| [Choose a primitive](/sdk/structured-output/choose-a-primitive) | Match the runtime pattern to the workflow. |

## The trust boundary

```text
Model response → JSON parsing → schema validation → trusted application data
```

The provider may use the schema to guide generation, but product code should trust only locally validated data.

## Structured output surfaces

Anvia uses Zod schemas across direct parsed completions, agent final output, extractors, tool contracts, and pipeline input.

Use a regular [completion](/sdk/completions) or agent response when the caller only needs prose. A schema is useful when another part of the application will read fields, branch on values, or persist the result.
