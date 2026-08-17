import { spawn } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm'
const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const children = new Set()
let shuttingDown = false

function start(script, cwd) {
  const child = spawn(pnpm, ['run', script], {
    cwd,
    stdio: 'inherit',
    env: process.env
  })

  children.add(child)
  child.once('exit', (code, signal) => {
    children.delete(child)

    if (shuttingDown) return

    shuttingDown = true
    stopChildren()
    process.exitCode = code ?? (signal ? 1 : 0)
  })

  return child
}

function stopChildren(signal = 'SIGTERM') {
  for (const child of children) {
    if (!child.killed) child.kill(signal)
  }
}

function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  stopChildren(signal)
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))

start('docs:dev:rc', docsDir)
start('docs:dev:current', docsDir)
