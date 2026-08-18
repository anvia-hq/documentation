import { spawn } from 'node:child_process'
import {
  prepareCurrentDocsSource,
  projectDir,
  removeCurrentDocsSource,
  vitepressBin
} from './docs-current-source.mjs'

const sourceDir = await prepareCurrentDocsSource()
let shuttingDown = false

const child = spawn(process.execPath, [
  vitepressBin,
  'dev',
  sourceDir,
  '--port',
  '5173',
  '--strictPort'
], {
  cwd: projectDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    DOCS_CHANNEL: 'current',
    DOCS_RC_DEV_PROXY: 'http://127.0.0.1:5174'
  }
})

async function finish(code = 0) {
  if (shuttingDown) return
  shuttingDown = true
  await removeCurrentDocsSource(sourceDir)
  process.exitCode = code
}

child.once('error', async (error) => {
  console.error(error)
  await finish(1)
})

child.once('exit', async (code, signal) => {
  await finish(code ?? (signal ? 1 : 0))
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    if (!child.killed) child.kill(signal)
  })
}
