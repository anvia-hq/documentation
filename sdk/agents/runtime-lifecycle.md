# Runtime lifecycle

An agent run is where stable agent configuration meets one product request. The application owns the request boundary; Anvia owns the model-and-tool loop inside it.

## Runtime objects

| Object | Owns |
| --- | --- |
| `AgentBuilder` | Stable model, instructions, tools, context, memory, observers, hooks, and defaults. |
| `Agent` | Reusable built behavior. |
| Session | Durable conversation identity and memory scope. |
| Prompt request | One input plus request-specific controls. |

```ts
const response = await agent
  .session(conversationId, {
    userId: user.id,
    metadata: { tenantId: user.tenantId },
  })
  .prompt(input.message)
  .withTrace({
    name: 'support-chat',
    userId: user.id,
  })
  .maxTurns(4)
  .send()
```

## Turn sequence

For a session run, Anvia:

1. Creates a run ID and loads prior memory.
2. Starts observers and run hooks.
3. Resolves dynamic context and tool definitions for the current prompt.
4. Builds the normalized model request and applies middleware.
5. Calls the model and applies any request-scoped retry policy.
6. Stores the assistant message according to the memory policy.
7. Executes requested tools, including approvals, hooks, and middleware.
8. Stores tool results and continues until no tool call remains, the run is cancelled, or the turn limit is reached.

Dynamic context and dynamic tools are selected again for each turn. A tool result from one turn becomes transcript context for the next.

## Send or stream

`.send()` and `.stream()` run the same lifecycle. `send()` returns the final response; `stream()` exposes runtime events while work is active.

Filter streamed events before they reach browsers because tool arguments, results, reasoning, and provider metadata may contain private data.

## Memory and events

Memory stores conversation messages for future prompts. An event store records runtime events for replay, debugging, and audit. They are separate concerns and should not replace each other.
