# Child events

Forward child-agent runtime events when operators or internal systems need to inspect nested work.

## Enable child streaming

Set `stream: true` on the agent tool:

```ts
const policyReview = policyAgent.asTool({
  name: 'policy_review',
  description: 'Review a draft answer for policy risk.',
  maxTurns: 2,
  stream: true,
})
```

Without `stream: true`, the coordinator still receives the child's final output as the tool result, but nested runtime events are not forwarded into the parent stream.

## Consume events from the parent

Only the parent request needs to be consumed:

```ts
const request = supportAgent
  .session(threadId, { userId: user.id })
  .prompt(message)

for await (const event of request.stream()) {
  if (event.type === 'agent_tool_event') {
    await operationsLog.write({
      childAgentId: event.agentId,
      toolName: event.toolName,
      childEvent: event.event.type,
    })
  }

  if (event.type === 'final') {
    await responses.save(event.output)
  }
}
```

An `agent_tool_event` identifies the child agent and the parent tool call, then carries the nested child event in `event.event`.

## Keep one stream owner

The parent stream is the product runtime boundary. Consume it completely so parent events, child events, tool results, final output, and memory writes can finish normally.

Do not start a second consumer for the child. Anvia forwards enabled child events through the active parent tool call.

## Project events for the UI

Child events are operational detail. Do not send raw reasoning, tool arguments, tool results, or provider metadata directly to a browser.

Map nested activity to a small product-safe status:

```ts
function toClientEvent(event: AgentStreamEvent) {
  if (event.type === 'agent_tool_event') {
    return {
      type: 'status',
      label: `Running ${event.toolName}`,
    }
  }
}
```

Expose full nested events only in reviewed internal inspection surfaces. Apply appropriate retention and redaction when sending them to logs or an observability backend.

## Group nested work

Use the child agent ID, tool name, call IDs, and parent run ID to keep events attached to the correct delegation. This becomes essential when a coordinator invokes several specialists in one run.
