# Durable execution, pipelines, or a job queue?

Use `@anvia/durable` when an agent run must survive a restart and continue from its committed model and tool results. Use a pipeline for typed, in-process workflow composition. Keep a job queue for application jobs, cron schedules, and pipeline retries.

| Need | Use |
| --- | --- |
| An agent run continues after a crash or deploy without repeating completed model or tool calls | [Durable execution](/features/durable-execution) |
| Work waits for an approval, a timer, or an external signal | Durable execution |
| A fixed set of agent tasks with dependencies runs as one graph | Durable [task graphs](/sdk/advanced/durable-execution/graphs) |
| Typed stages, branches, and decisions run inside one process | [Pipeline](/sdk/pipelines) |
| Recurring schedules, fan-out of application jobs, or whole-pipeline retries | Your job system, such as BullMQ or Trigger.dev |

## What does `@anvia/durable` provide?

It stores each submission, model response, tool result, approval, and progress event in SQLite, Postgres, Drizzle, or Prisma. On restart, `resume()` replays committed results instead of calling the model or tool again. It also provides model retry with backoff, deduplication by session and request ID, approvals and questions, timers and external signals for custom tasks, and task graphs. Several workers can share runs from one Postgres, Drizzle, or Prisma database, and a `DurableClient` can submit and control runs without executing them.

`@anvia/durable` is experimental (`0.18.0`). Database records may change between releases, a SQLite database has one runtime owner, and SQLite requires Node.js 22.16 or newer.

## What does it not cover?

- **Pipelines and agent teams.** Durable execution does not recover a Core pipeline or an `AgentTeam` run; this is follow-up work.
- **Cron scheduling.** Timers delay a task that is already running. Durable execution does not start work on a recurring schedule.
- **Exactly-once side effects.** Recovery is replay of committed operation results, not JavaScript stack restoration. Tools still need idempotency keys for external services.
- **Every agent feature.** Some features, such as non-recorded memory, unpinned MCP, and context sources, are rejected at registration. Check [agent feature compatibility](/packages/durable/capabilities#supported-agent-features) before moving an agent.

## Keep retry boundaries explicit

Retrying a complete pipeline or job can repeat tool side effects. Give external operations idempotency keys, store stable run IDs, and retry from the narrowest boundary the application can prove safe.

Studio can persist pipeline runs and logs for inspection and replay, but that history does not checkpoint a live pipeline or resume it after a process crash.

See [Durable execution](/sdk/advanced/durable-execution), [recovery](/sdk/advanced/durable-execution/recovery), [production workers](/sdk/pipelines/production-workers), and [retries](/sdk/advanced/parallel-and-batch/retries).

Reviewed against Anvia SDK `7aa42c0a` on 2026-11-24.
