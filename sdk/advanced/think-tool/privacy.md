# Privacy and visibility

Treat think content as ordinary tool transcript data. It may be internal to the product experience, but the runtime does not make it secret or ephemeral.

## 1. Know where it may appear

A think call and result may be present in:

- model-facing messages
- memory-backed session history
- agent stream events
- application logs and observability traces
- internal transcript or Studio views

Retention depends on the application's memory, logging, streaming, and observability configuration.

## 2. Keep sensitive values out

Do not ask the model to record credentials, tokens, hidden security policy, raw personal data, regulated data, or unrestricted tool output.

Prefer a short operational summary:

```text
The deployment timestamp aligns with the first errors. Database latency
does not. Verify the configuration change before proposing rollback.
```

This preserves the decision state without copying the complete evidence or requesting hidden chain-of-thought.

## 3. Project a safe user experience

Raw tool events are useful for internal operation but rarely belong in the browser transcript:

```text
think tool call       -> "Reviewing evidence"
echoed tool result    -> internal only
final agent output    -> user-visible response
```

Project raw stream events into explicit product-safe statuses. Apply access control, redaction, and retention limits to traces as well.

## 4. Review memory behavior

If memory persists completed messages, the checkpoint may become context for later requests in the session. Keep it concise, accurate, and relevant to the ongoing conversation.

If text must never survive the run, do not rely on the tool name. Configure the persistence boundary accordingly or keep the sensitive value out of the checkpoint.

Next, use the [production checklist](/sdk/advanced/think-tool/checklist).
