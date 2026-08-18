import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  prepareCurrentDocsSource,
  projectDir,
  removeCurrentDocsSource,
  run,
  vitepressBin
} from './docs-current-source.mjs'

const currentOnly = process.argv.includes('--current-only')
const distDir = resolve(projectDir, '.vitepress/dist')

await rm(distDir, { recursive: true, force: true })

const currentSourceDir = await prepareCurrentDocsSource()

try {
  await run(process.execPath, [
    vitepressBin,
    'build',
    currentSourceDir,
    '--outDir',
    distDir
  ], {
    env: {
      ...process.env,
      DOCS_CHANNEL: 'current'
    }
  })
} finally {
  await removeCurrentDocsSource(currentSourceDir)
}

if (!currentOnly) {
  await run(process.execPath, [vitepressBin, 'build'], {
    env: {
      ...process.env,
      DOCS_CHANNEL: 'rc'
    }
  })
}
