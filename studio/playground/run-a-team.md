# Run a team

Register an existing `AgentTeam` with Studio, pick it in the Playground, and submit a task to the coordinator. Studio uses the team as configured; you do not need a separate development-only definition.

```ts
import { Agent, AgentTeam } from '@anvia/core/agent'
import { Studio } from '@anvia/studio'

const researcher = new Agent({ id: 'researcher', model })
const team = new AgentTeam({ id: 'research-team', model, members: [researcher] })

new Studio([researcher, team]).start({ port: 4021 })
```

## 1. Select the team

The Playground target selector lists registered agents and teams. Select a team to open its team view at `/playground/teams/:teamId`. A Studio configured with only teams opens its first team automatically.

## 2. Submit a task and follow up

Submit a task to the coordinator and keep working while it runs: send follow-up prompts, watch member activity stream in, or stop the whole team. Team tasks are local to the current page, and stopping or leaving a task requests server cancellation independently of closing its stream.

The Messages panel shows sender, recipient, and delivery status for inter-agent messages (latest 500). The Members panel shows queued and active instances, including recursive children; select an instance to inspect its output, tool activity, run messages, and usage.

## 3. Approve as the requesting member asks

Approvals and questions surface as independent cards labeled with the requesting member, so several members can wait on input at once. Resolve them as the member requests; the team runtime enforces that only an application response counts as authorization.

## 4. Read the terminal state

Completed tasks stay visible until you start a **New task** — a new task can begin immediately after the result arrives. Completed tasks do not appear in saved agent sessions; team runs use ephemeral conversations, matching the [HTTP team run lifecycle](/studio/team-runs).
