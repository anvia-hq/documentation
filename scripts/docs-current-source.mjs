import { cp, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

export const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const vitepressBin = resolve(projectDir, 'node_modules/vitepress/bin/vitepress.js')

const currentDocsRef = process.env.DOCS_CURRENT_REF ?? '8607432'

export async function prepareCurrentDocsSource() {
  const sourceDir = await mkdtemp(join(tmpdir(), 'anvia-docs-v0-'))
  const archivePath = join(sourceDir, 'source.tar')

  await run('git', [
    'archive',
    '--format=tar',
    `--output=${archivePath}`,
    currentDocsRef
  ])
  await run('tar', ['-xf', archivePath, '-C', sourceDir])
  await rm(archivePath, { force: true })

  await symlink(resolve(projectDir, 'node_modules'), join(sourceDir, 'node_modules'), 'dir')

  // Keep shared presentation fixes in both channels while preserving v0 content.
  await cp(
    resolve(projectDir, '.vitepress/theme'),
    join(sourceDir, '.vitepress/theme'),
    { recursive: true, force: true }
  )
  await Promise.all([
    cp(
      resolve(projectDir, 'public/favicon-light.svg'),
      join(sourceDir, 'public/favicon-light.svg'),
      { force: true }
    ),
    cp(
      resolve(projectDir, 'public/favicon-dark.svg'),
      join(sourceDir, 'public/favicon-dark.svg'),
      { force: true }
    )
  ])

  const configPath = join(sourceDir, '.vitepress/config.ts')
  let config = await readFile(configPath, 'utf8')
  const originalConfig = config

  config = config.replace(
    "    ['link', { rel: 'icon', href: `${docsBase}logo.svg` }],",
    [
      "    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${docsBase}favicon-light.svg`, media: '(prefers-color-scheme: light)' }],",
      "    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${docsBase}favicon-dark.svg`, media: '(prefers-color-scheme: dark)' }],"
    ].join('\n')
  )

  if (!config.includes("./theme/landing-code-theme")) {
    config = config.replace(
      "import { defineConfig, type HeadConfig } from 'vitepress'\n",
      "import { defineConfig, type HeadConfig } from 'vitepress'\nimport { landingCodeTheme } from './theme/landing-code-theme'\n"
    )
    config = config.replace(
      '  vite: {',
      '  markdown: {\n    theme: landingCodeTheme\n  },\n  vite: {'
    )
  }

  if (config !== originalConfig) {
    await writeFile(configPath, config)
  }

  return sourceDir
}

export async function removeCurrentDocsSource(sourceDir) {
  await rm(sourceDir, { recursive: true, force: true })
}

export function run(command, args, options = {}) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: projectDir,
      stdio: 'inherit',
      ...options
    })

    child.once('error', rejectRun)
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolveRun()
        return
      }

      rejectRun(new Error(`${command} exited with ${code ?? signal ?? 'unknown status'}`))
    })
  })
}
