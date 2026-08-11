# When to use completions

Choose a direct completion when one model call is the complete workflow and application code already owns the input, output, and control flow.

## Good fits

- Summarize one document or record.
- Rewrite or translate content.
- Classify one input.
- Generate a short draft.
- Verify provider credentials and model behavior.
- Power a small internal utility without conversation state.

## Choose the runtime shape

| Need | Use |
| --- | --- |
| One free-form model response | Direct completion |
| One schema-validated model response | [Structured output](/sdk/structured-output) |
| Reusable instructions, tools, memory, or multiple turns | [Agent](/sdk/agents) |
| Repeated typed extraction from existing content | Extractor |
| Several deterministic and model-driven stages | [Pipeline](/sdk/pipelines) |

## Know the boundary

A direct completion makes one provider call. It does not:

- execute requested tool calls;
- load or save conversation memory;
- retrieve dynamic context automatically;
- repeat model turns;
- persist runtime events.

Keeping this boundary narrow makes completions easy to test and replace. Move to an agent only when the workflow actually needs orchestration.
