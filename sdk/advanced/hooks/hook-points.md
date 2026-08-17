# Lifecycle events

Choose the narrowest lifecycle event that contains the operational information you need.

## Run events

`onStart` runs once after the run ID and history are prepared. It receives the input message, history, and maximum turns.

`onFinish` runs once for a completed or guardrail-blocked run. Both forms include text, cumulative usage, and messages. Narrow `event.status`: the completed form has `output`, while the blocked form has `stage`.

`onError` runs when the run fails or is cancelled. It receives the error, cumulative usage, and messages available at failure time.

```ts
const lifecycle: AgentLifecycle = {
  onStart(event) {
    console.log('Started', event.runId)
  },
  onFinish(event) {
    console.log('Finished', event.runId, event.usage.totalTokens)
  },
  onError(event) {
    console.error('Failed', event.runId, event.error)
  },
}
```

## Step events

`onStepFinish` runs after a model turn finishes. It contains the one-based step number, normalized completion response, and cumulative usage.

A tool-using run can have several steps. Use this event for turn-level accounting or diagnostics, not for rewriting the response.

## Tool events

`onToolStart` runs after tool input has been parsed and approval requirements have been satisfied. It receives the step, tool name, call ID, and parsed input.

`onToolFinish` reports success or failure with duration. Successful events contain the tool output; failed events contain the error.

```ts
const lifecycle: AgentLifecycle = {
  onToolFinish(event) {
    toolMetrics.record({
      toolName: event.toolName,
      success: event.success,
      durationMs: event.durationMs,
    })
  },
}
```

## Use the correct adjacent surface

Lifecycle callbacks observe snapshots. Use middleware to transform completion requests, completion responses, tool inputs, or tool outputs.

Use guardrails to allow, block, or rewrite model-facing input and output. Use tool approval to suspend before selected side effects. Use agent stream events when a client needs live progress.

Next, understand [cancellation](/sdk/advanced/hooks/cancellation).
