import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const scriptsRoot = dirname(fileURLToPath(import.meta.url))

test('coverage gate rejects missing entrypoints, export drift, broken examples, and unknown packages', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'anvia-coverage-test-'))
  const path = join(directory, 'inventory.json')
  try {
    const inventory = JSON.parse(await readFile(join(scriptsRoot, 'sdk-coverage.json'), 'utf8'))
    inventory.entries = inventory.entries.filter(item => item.module !== '@anvia/client/transport')
    inventory.entries[0].exportNamesHash = 'stale'
    inventory.entries[0].reference = 'missing-page.md'
    inventory.features[0].marker = 'missing-example'
    inventory.utilities[0].symbols.push('missingExport')
    inventory.externalPackages = []
    await writeFile(path, JSON.stringify(inventory))
    await assert.rejects(
      run(process.execPath, [join(scriptsRoot, 'check-sdk-coverage.mjs')], {
        env: { ...process.env, ANVIA_COVERAGE_INVENTORY: path },
      }),
      error => {
        assert.match(error.stderr, /New public entrypoint needs a coverage decision: @anvia\/client\/transport/)
        assert.match(error.stderr, /exported names changed/)
        assert.match(error.stderr, /missing reference page/)
        assert.match(error.stderr, /missing complete checked example/)
        assert.match(error.stderr, /utility missingExport is not exported/)
        assert.match(error.stderr, /unknown Anvia package @anvia\/channel/)
        return true
      },
    )
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
