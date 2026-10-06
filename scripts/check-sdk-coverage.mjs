import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sdkRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const requireSDK = createRequire(join(sdkRoot, 'package.json'))
const ts = requireSDK('typescript')
const inventoryPath = resolve(process.env.ANVIA_COVERAGE_INVENTORY ?? join(docsRoot, 'scripts', 'sdk-coverage.json'))
const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: sdkRoot, encoding: 'utf8' }).trim()
const dirty = execFileSync('git', ['status', '--porcelain', '--', 'packages'], { cwd: sdkRoot, encoding: 'utf8' }).trim()
console.log(`SDK source: ${revision}; inventory reviewed at ${inventory.reviewedSdkRevision}${dirty ? '; package working tree has edits' : ''}`)

async function markdownFiles(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await markdownFiles(path))
    else if (entry.name.endsWith('.md')) files.push(path)
  }
  return files
}

function codeBlocks(markdown) {
  return [...markdown.matchAll(/^```(?:ts|typescript|tsx|js|javascript)([^\n]*)\n([\s\S]*?)^```\s*$/gm)]
    .map(match => ({ flags: match[1], code: match[2], line: markdown.slice(0, match.index).split('\n').length + 1 }))
}

const packages = new Map()
const entries = new Map()
for (const directory of await readdir(join(sdkRoot, 'packages'))) {
  const packageRoot = join(sdkRoot, 'packages', directory)
  const manifestPath = join(packageRoot, 'package.json')
  if (!existsSync(manifestPath)) continue
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
  if (manifest.private || !manifest.name?.startsWith('@anvia/')) continue
  packages.set(manifest.name, packageRoot)
  for (const [subpath, exported] of Object.entries(manifest.exports ?? {})) {
    if (subpath.startsWith('./internal/')) continue
    const types = exported?.types
    if (typeof types !== 'string') throw new Error(`No typed source mapping for ${manifest.name}${subpath}`)
    const source = resolve(packageRoot, types.replace(/^\.\/dist\//, './src/').replace(/\.d\.ts$/, '.ts'))
    if (!existsSync(source)) throw new Error(`Missing source entry: ${source}`)
    entries.set(subpath === '.' ? manifest.name : manifest.name + subpath.slice(1), source)
  }
}
const program = ts.createProgram([...entries.values()], {
  module: ts.ModuleKind.ESNext, moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022, skipLibCheck: true,
})
const checker = program.getTypeChecker()
const exportsByModule = new Map()
for (const [moduleName, path] of entries) {
  const file = program.getSourceFile(path)
  const symbol = file && checker.getSymbolAtLocation(file)
  if (!symbol) throw new Error(`Cannot discover exports: ${moduleName}`)
  exportsByModule.set(moduleName, checker.getExportsOfModule(symbol).map(item => item.name).sort())
}
const signature = names => createHash('sha256').update(JSON.stringify(names)).digest('hex')
const failures = []
const reviewed = new Map()
for (const item of inventory.entries) {
  if (reviewed.has(item.module)) failures.push(`Duplicate inventory entry: ${item.module}`)
  reviewed.set(item.module, item)
}
for (const moduleName of entries.keys()) {
  if (!reviewed.has(moduleName)) failures.push(`New public entrypoint needs a coverage decision: ${moduleName}`)
}
for (const item of inventory.entries) {
  const names = exportsByModule.get(item.module)
  if (!names) { failures.push(`Removed/unknown public entrypoint: ${item.module}`); continue }
  for (const field of ['guide', 'reference']) {
    if (typeof item[field] !== 'string' || !existsSync(join(docsRoot, item[field]))) {
      failures.push(`${item.module}: missing ${field} page ${item[field]}`)
    }
  }
  if (process.argv.includes('--refresh')) {
    item.exportCount = names.length
    item.exportNamesHash = signature(names)
  } else if (item.exportNamesHash !== signature(names) || item.exportCount !== names.length) {
    failures.push(`${item.module}: exported names changed; review documentation before refreshing the inventory`)
  }
}
for (const feature of inventory.features) {
  const names = exportsByModule.get(feature.module) ?? []
  for (const name of feature.symbols) {
    if (!names.includes(name)) failures.push(`${feature.title}: ${feature.module} does not export ${name}`)
  }
  const page = await readFile(join(docsRoot, feature.page), 'utf8')
  if (!codeBlocks(page).some(block => block.flags.includes('anvia-check') && block.flags.split(/\s+/).includes(feature.marker))) {
    failures.push(`${feature.title}: missing complete checked example ${feature.marker}`)
  }
  const tests = await readFile(join(docsRoot, 'scripts/check-sdk-runtime.mjs'), 'utf8')
  if (!tests.includes(`test('${feature.runtimeTest}'`)) failures.push(`${feature.title}: missing named runtime test`)
}
for (const decision of inventory.utilities) {
  const names = exportsByModule.get(decision.module) ?? []
  if (!['reference', 'integration-only'].includes(decision.coverage) || !decision.reason) {
    failures.push(`${decision.module}: utility decision needs a coverage category and reason`)
  }
  for (const name of decision.symbols) {
    if (!names.includes(name)) failures.push(`${decision.module}: utility ${name} is not exported`)
  }
  if (!existsSync(join(docsRoot, decision.page))) failures.push(`Missing utility reference: ${decision.page}`)
}

// Audit only imports owned by the SDK checkout. Sibling products are explicit exclusions.
const excluded = new Map()
let checkedImports = 0
const paths = (await Promise.all(['sdk', 'packages', 'examples', 'channels', 'lens', 'studio', 'faqs'].map(area => markdownFiles(join(docsRoot, area))))).flat()
for (const path of paths) {
  const markdown = await readFile(path, 'utf8')
  for (const [index, block] of codeBlocks(markdown).entries()) {
    const file = ts.createSourceFile(`${path}.${index}.tsx`, block.code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const statement of file.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue
      const moduleName = statement.moduleSpecifier.text
      if (!moduleName.startsWith('@anvia/')) continue
      const packageName = moduleName.split('/').slice(0, 2).join('/')
      const location = `${relative(docsRoot, path)}:${block.line + file.getLineAndCharacterOfPosition(statement.getStart(file)).line}`
      if (!packages.has(packageName)) {
        if (!inventory.externalPackages.includes(packageName)) failures.push(`${location}: unknown Anvia package ${packageName}`)
        else excluded.set(packageName, (excluded.get(packageName) ?? 0) + 1)
        continue
      }
      const names = exportsByModule.get(moduleName)
      if (!names) { failures.push(`${location}: not a public SDK entrypoint: ${moduleName}`); continue }
      const clause = statement.importClause
      const imports = []
      if (clause?.name) imports.push('default')
      if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        imports.push(...clause.namedBindings.elements.map(item => (item.propertyName ?? item.name).text))
      }
      for (const name of imports) {
        checkedImports++
        if (!names.includes(name)) failures.push(`${location}: ${moduleName} does not export ${name}`)
      }
    }
  }
}
for (const [name, count] of [...excluded].sort()) console.log(`Out of scope (sibling repository): ${name}, ${count} import declarations`)
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else if (process.argv.includes('--refresh')) {
  if (dirty) throw new Error('Cannot record a reviewed revision with uncommitted package changes')
  inventory.reviewedSdkRevision = revision
  await writeFile(inventoryPath, JSON.stringify(inventory, null, 2) + '\n')
  console.log('Refreshed export-name snapshot; inspect the diff and review coverage decisions before committing.')
} else {
  console.log(`Verified ${entries.size} public entrypoints, ${inventory.features.length} tested features, and ${checkedImports} SDK imports across ${paths.length} pages.`)
}
