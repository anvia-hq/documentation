# Build an operations assistant

**Level:** Application · **Estimated time:** 90 minutes

## Outcome

Build an incident assistant that reads runbooks, delegates analysis to specialists, and gates
dangerous tools behind application approval. The example stops at proposing actions; execution
requires an independently authorized tool boundary.

## When to use it

Use this for incident triage and operator decision support. Do not make an autonomous remediation
agent your first deployment: start read-only, measure it, then add narrowly scoped actions.

## Architecture

authenticated incident → read-only runbook search → parallel support/engineering/comms analysis →
coordinator → approval service → idempotent executor → audit trail.

```text
src/
  agents/coordinator.ts  agents/specialists.ts
  tools/runbooks.ts  tools/actions.ts
  auth/permissions.ts  approvals/service.ts
  incidents/repository.ts  server.ts
test/operations.test.ts
```

## Setup

```sh
pnpm add @anvia/core @anvia/openai @anvia/pgvector zod
```

## Make action policy executable

```ts
import { createHook } from "@anvia/core/hooks";

export function permissionHook(can: (name: string) => boolean) {
  return createHook({
    onToolCall({ toolName, tool }) {
      if (!can(toolName)) return tool.skip("The operator is not allowed to run this action.");
      if (toolName === "restart_service") {
        return tool.requestApproval({
          reason: "Restarting a service requires operator approval.",
          rejectMessage: "The restart was not approved.",
        });
      }
      return tool.run();
    },
  });
}
```

Without Studio or another approval handler, `requestApproval` cancels clearly. Your approval system
must bind the approval to the authenticated principal, exact normalized arguments, incident, and
expiry—not merely the tool name.

## Compose specialists

Create support, engineering, and communications agents, expose each with
`specialist.asTool({ name: "ask_engineering_agent" })`, and attach them to a coordinator with
`.tools([...]).defaultMaxTurns(4)`. Stream with `.withToolConcurrency(3)` when the tasks are
independent. Keep remediation tools out of specialist agents.

## Run and expected behavior

Submit an incident with customer impact and observed facts. The coordinator should retrieve a
runbook, delegate independent analysis, label unverified hypotheses, and return owner-specific next
steps. A restart request pauses or cancels for approval; a forbidden action is skipped before its
executor runs.

## Failure cases

- Runbook search returns stale guidance: surface its version and freshness.
- One specialist fails: mark the brief partial rather than silently filling the gap.
- Approval arrives after expiry: reject it and require a new proposal.
- A retried executor repeats a side effect: enforce an idempotency key downstream.

## Security and ownership

The application owns identity, permissions, approvals, secrets, network reachability, executor
credentials, idempotency, and audit retention. The model proposes arguments; it never grants its
own authority. Treat runbooks and tool results as untrusted data and redact operational secrets
before tracing.

## Production changes and tests

Separate the model service from privileged executors, use short-lived credentials, sign approval
records, enforce incident scopes, add hard timeouts, and persist every proposal/outcome. Test denied
permissions, tampered arguments, replayed approvals, stale runbooks, partial specialists,
idempotency, cancellation, and secret redaction.

## Runnable references

- [Agent as tool](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/07_multi_agent/01-agent-as-tool.ts)
- [Tool permission hook](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/02_tools/08-tool-permission-hook.ts)
- [RAG search tool](https://github.com/anvia-hq/anvia/blob/main/examples/cookbook/06_retrieval/05-rag-search-tool.ts)

These examples demonstrate primitives separately; the complete operations service is a suggested
architecture, not a published runnable project.

## Extensions

Add Studio approvals, sandboxed diagnostics, maintenance-window policy, Lens traces, post-incident
evaluation, and a read-only simulation mode.
