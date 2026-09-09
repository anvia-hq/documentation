# Hierarchy and spawning

The coordinator spawns members on demand, and members with permission can spawn too. Spawning starts an independent instance of a registered definition with its own conversation and its own tools — it does not inherit the parent's tools.

## 1. Default: coordinator spawns

Without `spawning` rules, only the coordinator can spawn, and it can spawn any registered member. Spawning returns an `instanceId` immediately; the child then runs to its outcome while the parent continues or waits.

## 2. Grant spawn permissions

`spawning` rules let instances of one definition spawn specific other definitions. Rules must reference the same `Agent` objects registered in `members`; duplicate rules or targets are rejected.

```ts
const team = new AgentTeam({
  id: 'architecture-team',
  model,
  members: [specialist, reviewer],
  spawning: [
    // Every specialist instance may start specialist or reviewer instances.
    { from: specialist, to: [specialist, reviewer] },
  ],
  limits: { maxDepth: 3, maxConcurrentAgents: 3, maxAgentInstances: 8, maxTotalTurns: 50 },
})
```

A self-reference (`from: specialist, to: [specialist, ...]`) enables recursion: a specialist can delegate a subproblem to another specialist instance. The runtime generates one `spawn_<member.id>` tool per definition and injects it only into instances whose policy allows it.

## 3. Depth and limits bound the tree

Every spawned instance is one level deeper than its parent; the coordinator is depth 0. `limits.maxDepth` (default 3) is a positive integer. Concurrency (`maxConcurrentAgents`, default 4), total instances (`maxAgentInstances`, default 12), and turns (`maxTotalTurns`, default 100) are shared by the whole tree. Hitting depth or instance limits rejects the spawn tool call — the parent keeps working with existing members — while exhausting the turn budget fails the team.

Within one instance, tools execute sequentially; different instances can execute concurrently, bounded by the shared concurrency limit.

## 4. Cancellation cascades down

`cancel_agent` is available to instances with spawn permissions and can cancel a direct child. Cancellation stops the child's entire subtree, including idle descendants, and stops parents before children — a cancelled descendant never reports to a live parent. Only the subtree root's cancellation is reported to its surviving parent; cancelled instances cannot receive further messages.

Failure cascades the same way: a member failure is reported to its immediate parent, and failure or blocking cancels that member's descendants.

## 5. Follow-ups within one execution

Each `generate()` or `stream()` call creates fresh instances. Member conversations are retained only within that execution: a member that finished can be revived by a new message and continues with its history. Pass `messages` instead of `prompt` to provide coordinator history. Durable team persistence and checkpoint/resume are not provided.

Continue with [streaming, steering, and cancellation](/sdk/advanced/multi-agent/agent-teams/streaming).
