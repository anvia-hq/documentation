# Get started

Install Studio beside Core in a local development entry point.

```sh
pnpm add @anvia/studio @anvia/core
```

Register built agents and pipelines, then bind the server to loopback:

```ts
import { Studio } from '@anvia/studio'
import { supportAgent } from './support-agent'
import { triagePipeline } from './triage-pipeline'

const studio = new Studio([supportAgent, triagePipeline], {
  quickPrompts: {
    support: ['Summarize this ticket', 'Draft a reply'],
  },
})

studio.start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

Open `http://127.0.0.1:4021/playground`. Studio calls the registered runtime objects directly; it does not create copies with separate tools, memory, or provider credentials.

Stable unique target IDs matter because URLs, sessions, traces, and pipeline replay records use them. Studio can uniquify duplicate registrations, but relying on that makes stored references less predictable.

State is in memory by default and disappears on restart. Add SQLite only when local sessions, traces, or pipeline history need to survive.

Studio is a trusted development server with agent and tool execution authority. Do not bind it to an untrusted network. Continue with [configuration](/packages/studio/configuration), [runtime boundary](/packages/studio/runtime-boundary), or the full [Studio guide](/studio/).
