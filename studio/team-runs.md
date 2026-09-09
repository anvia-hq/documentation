# Team runs

Studio can serve registered [Agent teams](/sdk/advanced/multi-agent/agent-teams) over HTTP with attributed JSONL event streams, coordinator steering, cancellation, and application-owned interaction responses. Team runs are a live runtime API; the browser console does not yet render team runs.

## Register a team

Pass team definitions alongside agents and pipelines. Agent and team IDs occupy separate namespaces, and members are not automatically registered as standalone agents.

```ts
import { Agent, AgentTeam } from '@anvia/core/agent'
import { Studio } from '@anvia/studio'

const researcher = new Agent({ id: 'researcher', model })
const team = new AgentTeam({ id: 'research-team', model, members: [researcher] })

await new Studio([researcher, team]).serve({ port: 4021 })
```

Duplicate team IDs are rejected. `GET /teams` and `/config` list team IDs, registered member definitions, and limits; `GET /teams/:teamId` returns one definition.

## Run and control a team

| Endpoint | Request | Behavior |
| --- | --- | --- |
| `POST /teams/:teamId/runs` | `{ prompt }` or `{ messages }` | Start an attributed JSONL event stream |
| `POST /teams/:teamId/runs/:runId/steer` | `{ prompt }` or user-only `{ messages }` | Queue user input for the coordinator |
| `POST /teams/:teamId/runs/:runId/cancel` | `{}` | Cancel the entire team |
| `POST /teams/:teamId/runs/:runId/interactions/:interactionId` | `AgentInteractionResponse` | Resolve one pending approval or question |

The stream begins with `{ type: 'team_run_started', teamId, runId }`; the same Studio control ID arrives in the `x-anvia-team-run-id` response header. Subsequent events follow the core `AgentTeamEvent` union — with core's `teamRunId`, instance IDs, parent IDs, and depth — followed by a terminal outcome or an `error` event. Internal agent continuation events are omitted; attributed `interaction` events carry everything an approval or question UI needs. `StudioTeamRunRequest`, `StudioTeamRunEvent`, and `StudioTeamConfig` are exported for clients.

Team requests accept at most 1 MiB of JSON and 256 messages; oversized bodies return 413.

## Resolve interactions

Runs and pending interactions are scoped to the team and Studio run ID. Several members can request approval simultaneously, and only the HTTP application can answer them: an invalid reply leaves the interaction pending, and repeated replies are rejected. Apply authentication and authorization middleware to these routes when exposing Studio remotely, as with other Studio execution routes.

## Lifecycle boundaries

- Disconnecting the stream or shutting down Studio cancels the team and its pending interactions.
- Completed runs leave the live registry; later control requests return 404.
- Core's configured event buffer limit (`maxBufferedEvents`) bounds unread events.
- Team runs use ephemeral conversations and are not stored in Studio's agent session history; the API provides no reconnection or durable resume.
