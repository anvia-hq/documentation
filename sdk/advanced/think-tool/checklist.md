# Think tool production checklist

Review the think tool as part of the complete agent loop, not as an isolated prompting technique.

## Before adding it

- Confirm the workflow contains a real decision after evidence gathering.
- Prefer a deterministic pipeline when the sequence is already known.
- Keep authorization, approvals, and side-effect protection in code.
- Verify the selected model supports reliable tool calling.

## Agent configuration

- Register think as a static tool when it must remain visible across turns.
- Give it a distinct name when `think` conflicts with another tool.
- State exactly when it should be used and what the checkpoint should contain.
- Set a concise length boundary.
- Avoid forcing it on simple requests or every turn.
- Leave enough `maxTurns` for evidence, the checkpoint, later actions, and the answer.

## Data handling

- Assume checkpoint text can appear in messages, streams, logs, traces, and memory.
- Keep secrets, credentials, raw personal data, and hidden policy out.
- Redact internal observer payloads and restrict trace access.
- Convert raw activity into safe UI statuses.
- Set retention according to the surrounding transcript's sensitivity.

## Behavior tests

Cover representative prompts where the agent should:

- answer directly without calling think
- gather evidence and then create one useful checkpoint
- continue to the correct next tool after the checkpoint
- stop safely when evidence or authorization is missing
- avoid copying sensitive tool output into the checkpoint
- stay within the configured turn budget

Do not assert identical checkpoint prose. Evaluate whether it appears at the right decision boundary and improves the resulting action or answer.

## Production monitoring

Track think call frequency, turn count, latency, failure rate, and downstream tool choice with Lens or another observer. Narrow or remove the tool when it adds cost and noise without improving outcomes.
