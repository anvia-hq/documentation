import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sdkOnly = process.argv.includes('--sdk')
const cliOnly = process.argv.includes('--cli')
const useSource = process.argv.includes('--source')
const anviaRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const typescriptCandidates = [
  join(anviaRoot, 'node_modules', 'typescript', 'lib', 'typescript.js'),
  join(anviaRoot, 'packages', 'core', 'node_modules', 'typescript', 'lib', 'typescript.js'),
]
const typescriptPath = typescriptCandidates.find(existsSync)

if (typescriptPath === undefined) {
  throw new Error(
    `TypeScript was not found under ${anviaRoot}. Set ANVIA_REPO to the Anvia checkout and install its dependencies.`,
  )
}

const typescriptModule = await import(pathToFileURL(typescriptPath).href)
const ts = typescriptModule.default ?? typescriptModule

const inventory = JSON.parse(
  await readFile(join(docsRoot, 'scripts', 'sdk-coverage.json'), 'utf8'),
)
const externalPackages = new Set(inventory.externalPackages ?? [])
const modulePackageName = (moduleName) => moduleName.split('/').slice(0, 2).join('/')

async function collectFiles(directory, predicate) {
  const files = []

  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.vitepress') continue

    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await collectFiles(path, predicate)))
    else if (predicate(path)) files.push(path)
  }

  return files
}

async function loadPackages() {
  const packageDirectories = await readdir(join(anviaRoot, 'packages'), { withFileTypes: true })
  const packages = new Map()

  for (const entry of packageDirectories) {
    if (!entry.isDirectory()) continue

    const directory = join(anviaRoot, 'packages', entry.name)
    const manifestPath = join(directory, 'package.json')
    if (!existsSync(manifestPath)) continue

    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
    if (manifest.name?.startsWith('@anvia/')) packages.set(manifest.name, { directory, manifest })
  }

  return packages
}

function resolvePackageEntry(moduleName, packages) {
  const packageName = [...packages.keys()]
    .filter((name) => moduleName === name || moduleName.startsWith(`${name}/`))
    .sort((left, right) => right.length - left.length)[0]

  if (!packageName) {
    if (externalPackages.has(modulePackageName(moduleName))) return { excluded: true }
    return { error: `unknown Anvia package ${moduleName}` }
  }

  const packageInfo = packages.get(packageName)
  const exportKey = moduleName === packageName ? '.' : `.${moduleName.slice(packageName.length)}`
  const exported = packageInfo.manifest.exports?.[exportKey]
  const typesPath = typeof exported === 'string' ? exported : exported?.types

  if (!typesPath) return { error: `${moduleName} is not a public package export` }

  if (!useSource) {
    const entryPath = resolve(packageInfo.directory, typesPath)
    if (!existsSync(entryPath)) return { error: `${moduleName} entry is missing at ${entryPath}` }
    return { entryPath }
  }
  const sourceBase = typesPath.replace(/^\.\/dist\//, './src/').replace(/\.d\.ts$/, '')
  const entryPath = [
    resolve(packageInfo.directory, `${sourceBase}.ts`),
    resolve(packageInfo.directory, sourceBase, 'index.ts'),
  ].find(existsSync)
  if (!entryPath) return { error: `${moduleName} entry is missing for ${sourceBase}.ts or ${sourceBase}/index.ts` }

  return { entryPath }
}

function codeBlocks(markdown) {
  const blocks = []
  const pattern = /^```(?:ts|typescript|tsx|js|javascript)[^\n]*\n([\s\S]*?)^```\s*$/gm
  let match

  while ((match = pattern.exec(markdown))) {
    blocks.push({ code: match[1], offset: match.index + match[0].indexOf(match[1]) })
  }

  return blocks
}

function lineAt(source, offset) {
  return source.slice(0, offset).split('\n').length
}

const packages = await loadPackages()
const documentationFiles = await collectFiles(
  sdkOnly ? join(docsRoot, 'sdk') : cliOnly ? join(docsRoot, 'packages', 'cli') : docsRoot,
  (path) =>
    path.endsWith('.md') ||
    (dirname(path) === join(docsRoot, 'public') &&
      basename(path).startsWith('llms') &&
      path.endsWith('.txt')),
)
if (cliOnly) documentationFiles.push(join(docsRoot, 'packages', 'cli.md'))
const imports = []
const entryPaths = new Set()
const failures = []
let excludedImports = 0

for (const markdownPath of documentationFiles) {
  const markdown = await readFile(markdownPath, 'utf8')

  for (const [blockIndex, block] of codeBlocks(markdown).entries()) {
    const sourceFile = ts.createSourceFile(
      `${markdownPath}.${blockIndex}.tsx`,
      block.code,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue

      const moduleName = statement.moduleSpecifier.text
      if (!moduleName.startsWith('@anvia/')) continue

      const location = `${relative(docsRoot, markdownPath)}:${lineAt(markdown, block.offset + statement.getStart(sourceFile))}`
      const resolution = resolvePackageEntry(moduleName, packages)

      if (resolution.excluded) {
        excludedImports += 1
        continue
      }

      if (resolution.error) {
        failures.push(`${location}: ${resolution.error}`)
        continue
      }

      entryPaths.add(resolution.entryPath)
      const clause = statement.importClause
      if (!clause) continue

      if (clause.name) imports.push({ entryPath: resolution.entryPath, imported: 'default', location, moduleName })
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          imports.push({
            entryPath: resolution.entryPath,
            imported: (element.propertyName ?? element.name).text,
            location,
            moduleName,
          })
        }
      }
    }
  }
}

const program = ts.createProgram([...entryPaths], {
  allowJs: false,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2022,
})
const checker = program.getTypeChecker()
const exportNamesByEntry = new Map()

for (const entryPath of entryPaths) {
  const sourceFile = program.getSourceFile(entryPath)
  const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile)
  const exportNames = new Set(moduleSymbol ? checker.getExportsOfModule(moduleSymbol).map((symbol) => symbol.name) : [])
  exportNamesByEntry.set(entryPath, exportNames)
}

for (const imported of imports) {
  if (!exportNamesByEntry.get(imported.entryPath)?.has(imported.imported)) {
    failures.push(
      `${imported.location}: ${imported.moduleName} does not export ${JSON.stringify(imported.imported)}`,
    )
  }
}

if (failures.length > 0) {
  console.error(failures.sort().join('\n'))
  console.error(
    `\n${failures.length} invalid Anvia imports across ${documentationFiles.length} documentation files.`,
  )
  process.exitCode = 1
} else {
  console.log(
    `Verified ${imports.length} named/default Anvia imports across ${documentationFiles.length} documentation files.`,
  )
  if (excludedImports > 0) {
    console.log(
      `Out of scope (sibling repository): ${excludedImports} import(s) from ${[...externalPackages].join(', ')}.`,
    )
  }
}
