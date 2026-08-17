# Runtime lifecycle

An agent run is where stable agent configuration meets one application request. The application owns the request boundary; Anvia owns the bounded model-and-tool loop inside it.

## Runtime objects

An `Agent` owns the model, instructions, context, tools, memory registration, policies, observers, and default limits.

A `session` scope adds a durable conversation identity to a run when the agent has memory configured.

A call to `generate()` or `stream()` supplies one input and optional run controls:

```ts
const result = await supportAgent.generate({
    prompt: input.message,
    maxTurns: 4,
    toolConcurrency: 2,
    trace: {
        name: 'support-run',
        userId: user.id,
        metadata: { ticketId: input.ticketId },
    }
})
```

An agent run accepts one options object containing either `prompt` or `messages`. A run with `session` uses `prompt` because it loads the transcript from the configured store.

## Run sequence

For a normal run, Anvia:

1. normalizes the input and validates run options;
2. creates a run ID and loads memory when a session is active;
3. starts observers and calls `lifecycle.onStart`;
4. evaluates input guardrails and commits accepted input to memory;
5. retrieves context documents and dynamic tool definitions for the current turn;
6. builds the normalized completion request and applies request middleware;
7. calls the model, using the run's opt-in retry policy for transient failures;
8. applies response middleware and records usage and step lifecycle data;
9. executes requested local tools, pausing first when approval is required;
10. stores assistant and tool messages, then starts another model turn; and
11. applies output guardrails, commits the completed run, closes observers, and returns the result.

Retrieval is evaluated again for each model turn. A tool result or steering message can therefore change the documents and dynamic tools selected next.

## Lifecycle callbacks

Use `lifecycle` for application-owned callbacks around the run:

```ts
import type { AgentLifecycle } from '@anvia/core'

const lifecycle = {
  onStart({ runId, maxTurns }) {
    console.log('run started', runId, maxTurns)
  },
  onStepFinish({ step, usage }) {
    console.log('step finished', step, usage.totalTokens)
  },
  onToolStart({ step, toolName }) {
    console.log('tool started', step, toolName)
  },
  onToolFinish(event) {
    console.log('tool finished', event.toolName, event.success)
  },
  onFinish(event) {
    console.log(
      'run finished',
      event.status === 'completed' ? event.output : `blocked at ${event.stage}`,
    )
  },
  onError({ error }) {
    console.error('run failed', error)
  },
} satisfies AgentLifecycle

const observedAgent = new Agent({
  id: 'observed-support',
  model,
  lifecycle,
})
```

Agent-level and run-level lifecycle callbacks are composed in that order. Callback input is snapshotted. If a lifecycle callback throws, the run fails and the error lifecycle is invoked.

Use observers for tracing and telemetry integrations. Lifecycle callbacks are application behavior; observers are integration surfaces with their own failure policy.

## Streaming lifecycle

`stream()` runs the same model, tool, guardrail, memory, and observer lifecycle while exposing events such as:

- `turn_start` and `generation_start`;
- `text_delta`, `reasoning_delta`, and optional `tool_call_delta`;
- `tool_call`, `tool_result`, and nested `agent_tool_event`;
- `source`, `provider_tool_call`, and `guardrail_decision`;
- `turn_end`, `approval_required`, `final`, and `error`.

A stream segment ends when approval is required. Resume the exact event with `agent.resume(event, decision)` to receive the next stream segment. Closing an active stream early cancels the run, finalizes memory and observers, and prevents silent work from continuing in the background.

Filter events before sending them to a client because reasoning, tool inputs, tool results, retrieved context, and provider metadata may contain private data.

Continue with [Errors and limits](/sdk/agents/errors-and-limits).
