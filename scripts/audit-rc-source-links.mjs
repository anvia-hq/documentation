import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anviaRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const expectedRef = process.env.ANVIA_REF ?? 'v1-rc3'

async function collectMarkdown(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.vitepress') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collectMarkdown(path)))
    else if (path.endsWith('.md')) files.push(path)
  }
  return files
}

const failures = []
let links = 0
const urlPattern = /https:\/\/github\.com\/anvia-hq\/anvia\/(blob|tree)\/([^/]+)\/([^\s)>,`]+)/g

for (const markdownPath of await collectMarkdown(docsRoot)) {
  const markdown = await readFile(markdownPath, 'utf8')
  let match
  while ((match = urlPattern.exec(markdown))) {
    links += 1
    const [, , ref, repositoryPath] = match
    const location = relative(docsRoot, markdownPath)
    if (ref !== expectedRef) {
      failures.push(`${location}: expected ${expectedRef}, found ${ref}: ${match[0]}`)
      continue
    }
    if (!existsSync(join(anviaRoot, repositoryPath))) {
      failures.push(`${location}: missing source path: ${repositoryPath}`)
    }
  }
}

if (failures.length > 0) {
  console.error(failures.sort().join('\n'))
  console.error(`\n${failures.length} invalid RC source links across ${links} checked links.`)
  process.exitCode = 1
} else {
  console.log(`Verified ${links} Anvia source links against ${expectedRef}.`)
}
