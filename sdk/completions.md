# Completions

Completions are the smallest model workflow in Anvia: one normalized request goes to one [completion model](/sdk/models/completion), then your application receives one normalized response.

Use them when application code already owns the control flow and does not need an agent loop.

## Explore completions

| Page | Learn how to |
| --- | --- |
| [Create a completion](/sdk/completions/create) | Configure the model input and send one request. |
| [Completion result](/sdk/completions/result) | Read assistant content, usage, sources, and the provider response. |
| [When to use](/sdk/completions/when-to-use) | Choose between a completion, agent, extractor, or pipeline. |

## Completion helpers

| Helper | Returns |
| --- | --- |
| `createCompletion(...)` | One final text and normalized response. |
| `createCompletionStream(...)` | Provider-level completion events as they arrive. |
| `createParsedCompletion(...)` | A schema-validated result plus the normal completion fields. |

Direct completions can send tools to a compatible model, but they do not execute tool calls. They also do not load memory or run multiple turns. Use an [agent](/sdk/agents) when the runtime should own that behavior.
