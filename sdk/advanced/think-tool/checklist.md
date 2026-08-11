# Production checklist

Review the think tool as part of the complete agent loop, not as an isolated prompt technique.

## Before adding it

- Confirm the workflow contains a real decision after gathering evidence.
- Prefer a deterministic pipeline when the sequence is already known.
- Keep authorization, approvals, and side-effect protection in code.
- Verify the selected model supports reliable tool calling.

## Agent configuration

- Register think as a static tool when it must remain available across turns.
- Give it a distinct name if `think` conflicts with another tool.
- State exactly when it should be used and what the checkpoint should contain.
- Avoid instructions that force it on simple requests or every turn.
- Leave enough `maxTurns` for evidence gathering, the checkpoint, and the final answer.

## Data handling

- Assume checkpoint text can appear in messages, streams, logs, traces, and memory.
- Keep secrets, credentials, raw personal data, and hidden policy out of it.
- Redact observer payloads and restrict access to internal traces.
- Convert raw tool activity into safe UI statuses for end users.
- Set retention according to the sensitivity of the surrounding transcript.

## Test the behavior

Cover representative prompts where the agent should:

- answer directly without calling think
- gather evidence and then use a checkpoint
- continue to the correct next tool after the checkpoint
- stop safely when evidence or authorization is missing
- avoid copying sensitive tool output into the checkpoint

Do not assert that the model must emit identical checkpoint prose. Evaluate whether the tool was used at the right decision boundary and whether the resulting action or answer improved.

## Monitor after release

Use Lens or another observability integration to inspect think call frequency, turn count, latency, and downstream tool choice. Remove or narrow the tool if it adds cost and noise without improving task outcomes.
