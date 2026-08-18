# Get started

## Create and connect

```ts
import { Agent } from '@anvia/core/agent'
import { DockerBrowserClient, createBrowserTools } from '@anvia/browser'
import { DockerSandboxClient } from '@anvia/sandbox'

const browserClient = new DockerBrowserClient({
  sandboxClient: new DockerSandboxClient(),
  image: process.env.ANVIA_BROWSER_IMAGE!,
})

const browser = await browserClient.createBrowser({
  workspace: { type: 'ephemeral' },
  network: { mode: 'bridge' },
  desktop: {
    protocol: 'novnc',
    password: process.env.ANVIA_BROWSER_VNC_PASSWORD!,
    viewport: { width: 1440, height: 900 },
  },
  resources: { memoryMb: 2048, cpus: 2, pidsLimit: 512, sharedMemoryMb: 1024 },
})

try {
  await browser.waitUntilReady({ timeoutMs: 30_000 })
  const connection = await browser.connect()
  const tools = createBrowserTools({
    connection,
    tools: ['browser_navigate', 'browser_snapshot', 'browser_click', 'browser_type'],
    navigation: { mode: 'origins', origins: ['https://app.example.com'] },
  })

  const agent = new Agent({
    id: 'browser-agent',
    model,
    instructions: 'Inspect a snapshot before every browser action.',
    tools,
  })

  const result = await agent.generate({ prompt: 'Open the support page and summarize its heading.' })
  if (result.status === 'completed') console.log(result.output)
  await connection.disconnect()
} finally {
  await browser.destroy()
}
```

Keep the browser, connection, and agent request in trusted server or worker code. Browser tools operate one selected tab at a time; include tab-management tools when the workflow may open or switch tabs.

## Stop and resume

`browser.stop()` preserves the container. `browserClient.resumeBrowser({ id })` starts fresh browser services in that container, after which the application must repeat readiness and connection. Use a named Docker volume when Chromium profile state must outlive container destruction.

Continue with [Security](/packages/browser/security) before browsing untrusted destinations.
