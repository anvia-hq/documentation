# Runs, queues, and prompts

A `DurableRun` is an identity and subscription handle for one persisted submission. Closing a stream or
aborting `result()` never cancels the work.

## 1. Submit with a stable request ID

```ts
const run = await runtime.submit({
  agentId: 'assistant',
  sessionId: 'tenant-42:conversation-7',
  requestId: 'message-123',
  prompt: 'Summarize the incident notes.',
})
```

Submission atomically stores a queued request and its `submitted` event before any work starts. Submissions
deduplicate by `(sessionId, requestId)`: an identical repeat returns the original run, and different content
under the same pair conflicts with `DurableConflictError`. Bind session IDs to your tenant and conversation
authorization; they organize history and are not authentication. Avoid the reserved `__anvia_graph__:` and
`__anvia_task__:` session prefixes.

## 2. Queue successors in a session

One run per session executes at a time. Without `enqueue`, submitting into a session that has unfinished work
fails. With it, the successor persists behind the current run:

```ts
await runtime.submit(
  {
    agentId: 'assistant',
    sessionId: 'tenant-42:conversation-7',
    requestId: 'message-124',
    prompt: 'Expand the previous findings.',
  },
  { enqueue: true },
)
```

A queued run captures the latest completed session history when it starts. Failed or cancelled predecessors
release the queue without adding partial work to history. Different sessions run in parallel up to
`maxConcurrentRuns` (default 4). Approvals and recovery blocks pause their own session queue but free capacity
for others.

## 3. Send images and files

`prompt` is a nonblank string or a core `UserMessage`:

```ts
const run = await runtime.submit({
  agentId: 'assistant',
  sessionId: 'image-chat',
  requestId: 'image-message-1',
  prompt: {
    role: 'user',
    content: [
      { type: 'text', text: 'Describe this image.' },
      { type: 'image', image: { type: 'data', data: imageBase64 }, mediaType: 'image/png' },
    ],
  },
})
```

Image URLs use `image: { type: 'url', url }`, and file parts work too. Media-only user messages are accepted;
empty messages, non-user roles, and invalid parts are rejected. The model must support the media. Inline data
is captured in the journal, while URLs stay external and must remain reachable for retries and later turns.
Equivalent JSON prompts deduplicate regardless of key order, and changed content or metadata conflicts. Size
`limits.maxPayloadBytes` for base64 growth. Code that reads `run.prompt` must handle both strings and
messages.

## 4. Discover and reopen runs

```ts
const page = await runtime.listRuns({
  sessionId: 'tenant-42:conversation-7',
  status: 'waiting', // approvals, failures, or recovery blocks
  limit: 25,
})
for (const summary of page.runs) {
  const run = await runtime.getRun(summary.id)
  const snapshot = await run.snapshot()
  // Inspect snapshot.run.outcome for approvals, or blockedOperation for reconciliation.
}
```

Listings return summaries without prompts or results, filter by `sessionId`, `agentId`, and `status`, and hold
at most 100 runs in insertion order. `nextCursor` is an exclusive insertion cursor that is separate from
event cursors. Status filters reflect live state, so restart a listing to find older runs that changed.

## 5. Wait for a result

`run.result({ abortSignal })` resolves with the agent outcome and throws `DurableRunError` when the run failed
or was cancelled. It does not approve anything: a run can sit in `waiting` or `needs_attention` indefinitely,
so build the approval and recovery paths before relying on `result()` alone.

`run.cancel()` persists an explicit cancellation that is never restarted automatically. It cannot undo an
external effect, and a new run in the same session is rejected while the cancelled callback is still settling.

Next: [progress events and streaming](/sdk/advanced/durable-execution/streaming).
