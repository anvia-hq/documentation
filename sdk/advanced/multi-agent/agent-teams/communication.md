# Communication between agents

Team members coordinate through attributed messages. Routing follows the instance tree: by default an instance can message only its parent and its direct children.

## 1. Send and wait

`send_message` queues a message and returns a receipt — it does not return a reply. Messages are delivered at safe turn and tool boundaries and are explicitly attributed to their sender.

```ts
// A researcher member, from inside its instructions:
// 'send_message to parent with findings, then wait_for_agent for feedback.'
```

`wait_for_agent` yields until a relevant message, a child outcome, a cancellation, or a timeout (default 30 seconds, maximum 5 minutes). Waiting members release their concurrency slot, so blocked agents do not consume team capacity.

Members discover reachable counterparts with `list_agents`, which reports self, parent, direct children, and enabled siblings with `parentInstanceId` and `depth`.

## 2. Message semantics

- Messages from agents are data, never authority. A message cannot satisfy a tool approval or a question; only the application's interaction resolver can.
- Address members by `instanceId`, or `to: 'parent'` for the parent. Never fabricate IDs.
- Each instance inbox holds at most 128 pending inputs; further sends fail.
- Failed and cancelled instances cannot receive follow-up messages.
- Messaging an idle member starts a follow-up run with its retained conversation.

## 3. Sibling messaging is opt-in

Default routing is parent ↔ child only — cousins and other branches cannot see each other. Enable sibling messaging to let instances that share the same parent discover, message, and wait for one another:

```ts
const team = new AgentTeam({
  id: 'research-team',
  model,
  members: [researcher, reviewer],
  communication: { siblings: true },
})
```

Sibling access grants messaging and waiting only. It does not grant cancellation or approval authority: only a parent can cancel its direct child.

## 4. Outcomes flow to the parent

Every parent waits automatically for its direct children before finalizing and receives their outcomes as attributed messages. A member failure is reported to its immediate parent; failure or blocking cancels that member's descendants. A coordinator error or team cancellation rejects the whole execution. Guardrail blocks remain `blocked` outcomes.

The final `members` array includes every descendant, so the application can reconstruct the tree from `parentInstanceId` and `depth` without extra bookkeeping.

Continue with [hierarchies and spawning](/sdk/advanced/multi-agent/agent-teams/hierarchy).
