# Agents

Agents wrap a [completion model](/sdk/models/completion) with reusable behavior and a bounded runtime loop. They can combine instructions, tools, memory, knowledge, hooks, and observability across one or more model turns.

## Explore agents

| Page | Learn how to |
| --- | --- |
| [Build an agent](/sdk/agents/build) | Create an agent and send its first prompt. |
| [Stable behavior](/sdk/agents/stable-behavior) | Decide what belongs on the builder or in a scoped factory. |
| [Instructions](/sdk/agents/instructions) | Define durable policy, role, tone, and workflow rules. |
| [Context](/sdk/agents/context) | Supply static facts, retrieved knowledge, and request state. |
| [Per-run controls](/sdk/agents/per-run-controls) | Configure and execute one prompt request. |
| [Runtime lifecycle](/sdk/agents/runtime-lifecycle) | Understand the model, tool, memory, and event sequence. |
| [Errors and limits](/sdk/agents/errors-and-limits) | Bound runs and map failures into safe product responses. |

## Agent lifecycle

```txt
agent defaults → prompt request → model turn → optional tools → final response
```

The builder defines behavior shared by every run. The prompt request supplies one input and any tighter run-specific controls. Anvia owns the model-and-tool loop; the application still owns authentication, permissions, services, persistence policy, and the response exposed to users.

Use a [direct completion](/sdk/completions) when the workflow needs only one model call and no agent orchestration.
