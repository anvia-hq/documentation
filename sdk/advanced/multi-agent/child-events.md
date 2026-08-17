# Child events

Enable child streaming when internal operators or application logic need to inspect nested agent progress.

## 1. Forward child events

```ts
const policyReview = policyAgent.asTool({
  name: 'policy_review',
  description: 'Review a draft answer for policy risk.',
  maxTurns: 2,
  stream: true,
})
```

Child events are forwarded only when the parent is itself consumed with `stream()` and the child model supports streaming.

## 2. Consume the parent stream

```ts
const session = { sessionId: threadId, userId: user.id };
for await (const event of supportAgent.stream({
    prompt: message,
    session: session
})) {
    if (event.type === 'agent_tool_event') {
        await operationsLog.write({
            parentTurn: event.turn,
            childAgentId: event.agentId,
            childAgentName: event.agentName,
            toolName: event.toolName,
            internalCallId: event.internalCallId,
            childEventType: event.event.type,
        });
    }
    if (event.type === 'final') {
        if (event.result.status === 'completed') {
            await responses.save(event.result.output);
        }
    }
}
```

`agent_tool_event` identifies the parent turn, tool and call, child agent, and wrapped child event.

## 3. Keep one stream owner

Consume the parent stream completely so child work, parent tool results, final output, memory writes, lifecycle callbacks, and observers can settle normally.

Do not create a second consumer for the child. Anvia forwards its enabled events through the active parent tool call.

## 4. Project events for clients

Nested events can contain private prompts, reasoning, tool arguments, tool results, model requests, and errors. Map them to a reviewed product status:

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

Use `turn`, `toolName`, `toolCallId`, `internalCallId`, and `agentId` to attach nested work to the correct delegation. Apply redaction and retention rules to operational event storage.

Next, define [memory boundaries](/sdk/advanced/multi-agent/memory).
