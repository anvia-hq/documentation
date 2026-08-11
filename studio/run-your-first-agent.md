# Run your first agent

Register an Anvia agent with Studio, send a prompt from the Playground, and inspect the model work recorded for that session.

## Before you start

Complete [Install and setup](/studio/install-and-setup). You should be able to start `studio.ts` with a valid provider key.

## Register a useful development target

An agent's stable ID, display name, and description make it easier to identify in Studio. Quick prompts can capture the small checks you repeat while developing it.

```ts
import 'dotenv/config'
import { AgentBuilder } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
})

const supportAgent = new AgentBuilder(
  'support',
  client.completionModel('gpt-5'),
)
  .name('Support')
  .description('Turns support questions into concrete next steps.')
  .instructions(
    'Answer support questions clearly. Ask for any missing facts before diagnosing the issue.',
  )
  .defaultMaxTurns(4)
  .build()

new Studio([supportAgent], {
  quickPrompts: {
    support: [
      'What details do you need to investigate a failed checkout?',
      'Draft a short update for a customer waiting on an incident.',
    ],
  },
}).start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

The key passed to `quickPrompts` must match the agent ID, `support`. Quick prompts are shortcuts for repeatable development checks; they do not become agent instructions.

## Start Studio

```sh
pnpm studio
```

Open `http://127.0.0.1:4021/playground`. Studio should select **Support** as the available agent and show its quick prompts.

If the page does not open, first check the runtime directly:

```text
http://127.0.0.1:4021/health
```

A healthy Studio process returns a JSON response with `status: "ok"`.

## Send a prompt

Create a session in the Playground, then send:

```text
A customer says checkout fails, but has not shared an error message. What should I ask next?
```

The answer streams from the registered provider model. This is a real `supportAgent` run, not a browser-only preview.

## Inspect the run

After the response completes, use the Studio navigation to check the same execution from several angles:

1. In **Playground**, review the user message, streamed assistant response, duration, and available usage.
2. In **Sessions**, open the conversation and confirm the messages and recorded run steps are grouped together.
3. In **Traces**, open the session trace and inspect the model generation, its input and output, timing, and usage.
4. In **Agents**, open **Support** and verify the model, turn limit, and enabled capabilities match the code.

Studio automatically adds its local trace observer to registered agents. Runs created through the Playground are associated with a Studio session, allowing the generated trace to appear in the trace browser.

## Iterate on the agent

Change one part of the agent, restart Studio, and send the same quick prompt again. For example, tighten the instruction:

```ts
.instructions(
  'Ask for the exact error, checkout step, timestamp, and order ID before suggesting a cause.',
)
```

This tight loop is Studio's primary purpose: keep the test prompt stable while changing instructions, models, tools, context, or runtime limits, then inspect what actually happened.

Studio uses in-memory storage by default, so sessions and traces disappear when the process restarts. Persistent local storage is optional and is covered later under Studio configuration.

Next, read [How Studio works](/studio/how-studio-works).
