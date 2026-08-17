# Should I use a completion or an agent?

Use a direct completion when one model call is the complete workflow. Use an agent when Anvia needs to manage reusable instructions, tools, memory, retrieval, lifecycle policy, or multiple model turns.

| Need | Prefer |
| --- | --- |
| Summarize, rewrite, classify, or draft once | [Completion](/sdk/completions) |
| Return one schema-validated object | [Parsed completion](/sdk/structured-output/parsed-completion) |
| Let the model choose and call tools | [Agent](/sdk/agents) |
| Continue a stored conversation | Agent with [memory](/sdk/memory) |
| Retrieve context before answering | Agent with [knowledge](/sdk/knowledges) |

## Why not use an agent for everything?

A direct completion has a smaller control surface: one request, one provider call, and one result. An agent adds a bounded runtime loop and additional failure, latency, and usage paths. Add that orchestration only when the workflow needs it.

## Does a direct completion execute tool calls?

No. A completion can return a model-requested tool call, but it does not run the handler or continue the model loop. An agent owns validation, execution, tool-result messages, and subsequent turns.

## Does an agent own product policy?

No. The application still owns authentication, authorization, tenant scope, services, persistence policy, and the response exposed to users. Instructions guide model behavior; they do not enforce permissions.

See [When to use completions](/sdk/completions/when-to-use) and [Agent runtime lifecycle](/sdk/agents/runtime-lifecycle) for the full boundaries.
