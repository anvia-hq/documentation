# Install and setup

Add Studio to the server-side TypeScript project that already contains your Anvia agents. Studio runs in Node.js and serves both its browser console and local HTTP runtime from that process.

## Before you start

You need:

- an ESM TypeScript project;
- pnpm;
- an Anvia completion model and its provider credentials;
- an agent you can run on the server.

If you do not have an agent yet, complete the SDK's [Install and setup](/sdk/install-and-setup) first.

## Install Studio

For an existing Anvia application, add the Studio package:

```sh
pnpm add @anvia/studio
```

For a new OpenAI-backed example, install the complete minimal runtime:

```sh
pnpm add @anvia/core @anvia/openai @anvia/studio
pnpm add -D dotenv tsx typescript @types/node
```

`@anvia/core` is a peer dependency of Studio. Keep it on a compatible version in the application that owns the agents.

## Configure the provider

Create a local `.env` file for the server process:

```dotenv
OPENAI_API_KEY=your_api_key
```

Keep `.env` out of source control. Provider credentials stay in the Node.js process; the Studio browser does not need them.

## Create a Studio entry point

Create `studio.ts` next to your application code:

```ts
import 'dotenv/config'
import { Agent } from '@anvia/core/agent'
import { OpenAIClient } from '@anvia/openai'
import { Studio } from '@anvia/studio'

const client = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY!,
})

const agent = new Agent({
  id: 'support',
  model: client.completionModel({
      modelId: 'gpt-5.6-sol',
      api: "responses"
  }),
  name: 'Support',
  description: 'Answers product support questions.',
  instructions: 'Answer clearly. Ask for missing details before making assumptions.',
  maxTurns: 4,
})

new Studio([agent]).start({
  hostname: '127.0.0.1',
  port: 4021,
})
```

Passing the agent to `Studio` registers it as a runnable target. Its name and description become useful labels in the browser, while its model, instructions, tools, context, and runtime behavior remain the agent's own configuration.

## Add a development command

Add a script to `package.json`:

```json
{
  "scripts": {
    "studio": "tsx studio.ts"
  }
}
```

Start the local console:

```sh
pnpm studio
```

The process prints its browser address. With the configuration above, open:

```text
http://127.0.0.1:4021/playground
```

The root URL redirects to the Playground by default.

## Port and process behavior

`start()` uses the port you pass, then `RUNNER_PORT`, then `4021`. It also handles `SIGINT` by default, so pressing `Ctrl+C` closes the local server cleanly.

Keep the Studio entry point separate from the application entry point. That makes it easy to run during development without accidentally starting the browser console in production.

Continue with [Run your first agent](/studio/run-your-first-agent).
