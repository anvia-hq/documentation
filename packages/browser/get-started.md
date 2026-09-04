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
  // Wait only for the capabilities this workflow requires.
  await browser.waitForCapabilities({
    capabilities: ['automation', 'desktop'],
    timeoutMs: 30_000,
  })
  const connection = await browser.connect({
    timeoutMs: 30_000,
    scheduling: { mode: 'per-tab', maxConcurrentTabs: 8 },
  })
  const tools = createBrowserTools({
    connection,
    tools: [
      'browser_list_tabs',
      'browser_navigate',
      'browser_snapshot',
      'browser_click',
      'browser_type',
    ],
    navigation: { mode: 'origins', origins: ['https://app.example.com'] },
  })

  const agent = new Agent({
    id: 'browser-agent',
    model,
    instructions: 'Inspect a snapshot before every browser action.',
    tools,
  })

  const result = await agent.generate({ prompt: 'Open the support page and summarize its heading.' })
  if (result.type === 'response') console.log(result.output)
  await connection.disconnect()
} finally {
  await browser.destroy()
}
```

Keep the browser, connection, and agent request in trusted server or worker code. One `DockerBrowser` handle serves one active or pending automation connection; share it across agents that use the same browser, and pass an explicit `tabId` to the page tools when they work independent tabs. Include the tab-management tools when a workflow may open or switch tabs, and call `browser_list_tabs` again after reconnecting because tab IDs are scoped to one connection. `waitUntilReady({ timeoutMs })` remains available as a thin wrapper when a workflow genuinely requires all four capabilities.

## Stop and resume

`browser.stop({ timeoutMs, abortSignal })` cancels pending readiness and connection work, disconnects the automation workers, and preserves the container. `browserClient.resumeBrowser({ id })` starts fresh browser services in that container and returns a new handle that requires new readiness and connection. `browser.destroy({ timeoutMs, abortSignal })` starts an irreversible terminal transition that removes the sandbox. Use a named Docker volume when Chromium profile state must outlive container destruction.

Continue with [Security](/packages/browser/security) before browsing untrusted destinations.
