# Typed decisions or structured output?

Use a typed decision when the application needs a bounded judgment it can branch on: a label, several labels, a score, or a yes/no probability. Use structured output when the model must produce a free-form object, such as extracted fields or a drafted record.

| Need | Use |
| --- | --- |
| Route a ticket to one department | [`decide()`](/sdk/decisions) with `choice` |
| Tag content with several topics | `decide()` with `multiLabel` |
| Rate urgency on a rubric | `decide()` with `score` |
| Verify a claim and get a probability | `decide()` with `check` |
| Extract fields from a document | [`extract()`](/sdk/structured-output/extractors) |
| Return a validated object from one call | [`generateCompletion({ outputSchema })`](/sdk/structured-output/parsed-completion) |
| Return a validated object after tools or retrieval | [Agent output schema](/sdk/structured-output/agent-output) |

## How are decisions different?

`decide()` validates the request before the provider call and validates the answers afterward, so a malformed answer throws instead of reaching branching code. Answers are typed from the questions: a `choice` answer is the union of its option keys. `decideBatch()` runs many inputs with bounded concurrency.

Decisions need a decision model. `@anvia/jev` and `@anvia/openai` provide one; other completion providers do not. Import `decide` and the question helpers from `@anvia/core/decision` or the root `@anvia/core`.

## Can a workflow branch on a decision?

Yes. Pipelines provide [`.decide()` and `.route()` stages](/sdk/pipelines/decisions-and-routing); `.route()` runs only the branch the decision selects.

See [Typed decisions](/sdk/decisions), [questions](/sdk/decisions/questions), and [structured-output primitives](/faqs/capabilities/structured-output).
