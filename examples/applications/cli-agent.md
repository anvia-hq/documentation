# Build a streaming CLI agent

**Level:** Application · **Estimated time:** 45 minutes

## Outcome

Build a terminal assistant with streaming text, optional reasoning, faithful tool-call history, and
workspace-scoped tools. Anvia includes a complete React + Ink example of this application.

## When to use it

Use a CLI for developer workflows, local automation, or fast internal tools. Use a web application
when identity, shared state, approvals, and remote access are primary requirements.

## Architecture

Ink UI → application transcript → Anvia `Message[]` → agent stream → text/reasoning/tool events →
UI reducer. Tools run behind a workspace boundary; the UI never parses provider-native events.

```text
src/
  app.tsx  agent.ts  memory.ts  types.ts
  tools/local.ts  tools/tavily.ts
  components/transcript.tsx
```

## Setup

Clone the Anvia repository and run the existing application:

```sh
pnpm install
cp examples/cli-agent/.env.example examples/cli-agent/.env
pnpm --filter anvia-cli-agent dev
```

Set `OPENROUTER_API_KEY`; `ANVIA_MODEL` and `TAVILY_API_KEY` are optional.

## Stream application events

```ts
const transcript = [...toAnviaHistory(history), { role: "user", content: prompt }];

for await (const event of agent.stream({
    messages: transcript,
    maxTurns: 50
})) {
  if (event.type === "text_delta") onDelta(event.delta);
  if (event.type === "reasoning_delta") onReasoningDelta?.(event.delta);
  if (event.type === "tool_call") onToolCall?.(event.toolCall);
  if (event.type === "tool_result") onToolResult?.({
    id: event.internalCallId,
    name: event.toolName,
    result: event.result,
  });
  if (event.type === "error") throw event.error;
}
```

The runnable example also reconstructs structural assistant `tool-call` parts and separate tool
messages containing matching `tool-result` parts. Preserve that ordering: sending only visible text
loses the tool history the next model turn needs.

## Run and expected behavior

`pnpm dev` opens the Ink interface. Text grows as deltas arrive; reasoning appears only when the
model emits it; Tavily search is disabled without its key. Local tools are scoped to `.tmp`, and
conversation history disappears when the process exits.

## Failure cases

- A provider or tool error must leave the terminal input usable.
- `Ctrl+C` should abort active consumption before process exit.
- Tool output can exceed the terminal budget and must be capped or summarized.
- Replaying incomplete tool calls produces invalid history; persist complete event groups.

## Security and ownership

The CLI owns credential loading, confirmation UX, workspace resolution, command allow-lists, and
transcript retention. A `.tmp` path check is useful but not equivalent to OS isolation. Do not offer
arbitrary shell execution for untrusted users; use the sandbox package for stronger isolation.

## Production changes and tests

Add signal cancellation, redacted structured logs, configurable limits, explicit confirmation for
side effects, atomic transcript persistence, and provider retry policy. Test path traversal,
symlink escapes, failed commands, split stream events, tool-call round trips, missing optional keys,
and terminal resize behavior.

## Runnable reference

- [Complete CLI agent](https://github.com/anvia-hq/anvia/tree/v1-rc3/examples/cli-agent)

Unlike most documentation snippets, that directory is a runnable multi-file example.

## Extensions

Add SQLite-backed memory, selectable providers, tool approval policies, Docker sandbox tools, session
resume, and an exportable Markdown transcript.
