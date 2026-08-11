# When to use

Use the think tool when an explicit checkpoint can improve the next decision—not simply because a request is long.

## Good candidates

| Workflow | Why a checkpoint helps |
| --- | --- |
| Incident investigation | Compare evidence before proposing a cause or remediation. |
| Research across tools | Track what is known and identify the next missing fact. |
| Support diagnosis | Reconcile account, billing, and ticket results before answering. |
| Multi-step operations | Confirm prerequisites before selecting the next tool. |
| Sensitive action preparation | Summarize evidence before entering a separate approval flow. |

Think is most valuable after the model has received new evidence and still has a meaningful choice to make.

## Skip it for simple work

Do not add a checkpoint to:

- direct questions that need no tool
- a single deterministic lookup
- straightforward extraction or transformation
- workflows already encoded as a deterministic pipeline
- decisions that must be enforced by authorization or policy code

Forcing a think call on every request adds a tool call, another model turn, latency, and transcript noise.

## Think versus model reasoning

Provider reasoning and the think tool are different surfaces. Provider reasoning is a model capability and may be represented differently across providers. Think is an ordinary Anvia tool call with an explicit text input and result.

Use think when the application benefits from a structured checkpoint in the tool loop. Do not use it merely to imitate a provider's native reasoning mode.

## Think versus safety controls

A sentence such as “check the request before issuing a refund” can improve model behavior, but it cannot authorize a refund. The protected tool must still validate the user, permissions, amount, idempotency, and approval state.

Think supports judgment. It never replaces enforcement.
