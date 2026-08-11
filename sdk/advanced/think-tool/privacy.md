# Privacy and visibility

Treat think content as tool transcript data. “Private” means it is not intended as the user-facing answer; it does not mean the runtime hides or discards it.

## Know where it can appear

A think call may be present in:

- model-facing tool call and result messages
- memory-backed session history
- agent stream events
- application logs and observability traces
- internal transcript or Studio views

The exact retention depends on the memory, streaming, logging, and observability configuration owned by the application.

## Keep sensitive values out

Do not ask the model to place these values in a checkpoint:

- credentials, API keys, or access tokens
- hidden security policy
- raw personal or regulated data
- unrestricted tool responses
- private reasoning that must never be retained

Prefer a short operational summary:

```text
The deployment timestamp aligns with the first errors. Database latency
does not. Verify the configuration change before proposing rollback.
```

This preserves the useful decision state without copying all underlying evidence.

## Separate internal and user-facing streams

Tool events are useful for internal inspection but rarely belong in the browser transcript. Project the agent stream into product-safe statuses instead of forwarding raw think arguments or results:

```text
think tool call              → "Reviewing evidence"
internal tool result         → not forwarded
final agent output           → user-visible response
```

Apply the same principle to traces: capture enough to operate the system, redact sensitive fields, restrict access, and set an appropriate retention period.

## Review memory behavior

If memory persists completed messages, think calls and results may become part of later session context. Keep checkpoints concise and relevant to the ongoing conversation.

If a checkpoint should never survive the run, do not assume its tool name makes it ephemeral. Configure the surrounding persistence boundary accordingly or avoid recording the sensitive content in the first place.
