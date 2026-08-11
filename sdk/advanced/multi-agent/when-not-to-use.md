# When not to use multiple agents

Keep one agent when a task is one workflow with the same instructions, tools, model, and policy.

## The cost of another agent

Every specialist adds another prompt, model call, context window, turn budget, trace, latency source, and failure path. Those costs are worthwhile only when the child creates a useful boundary.

## Choose the smallest runtime

| Situation | Prefer |
| --- | --- |
| One model call with application-owned control flow | Direct completion |
| One role using one tool and policy set | One agent |
| One deterministic reusable action | A tool |
| Known sequence of typed steps | A pipeline |
| Distinct specialist chosen through model judgment | Multi-agent coordination |

Do not create a specialist merely to wrap one ordinary tool call or to split a short instruction into separate prompts.

## Add a child only for a boundary

A child agent is justified when at least one of these is distinct:

- role and instructions
- allowed tool set
- completion model
- knowledge or permission scope
- output expectation
- independent testing and evaluation

If none applies, keep the work in the coordinator.

## Prefer deterministic composition

If every request must call the same two specialists, the application can call them directly or use a pipeline and then pass their results to one synthesis step. A coordinator is useful when the model must decide whether, when, or which specialist to invoke.

## Review the result

After implementing a multi-agent flow, measure whether it improves task quality enough to justify its extra latency and usage. If the child repeats the parent's work, receives the full parent context, or rarely changes the result, remove it.
