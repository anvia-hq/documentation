import { existsSync } from 'node:fs'
import { readFile, readdir } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anviaRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const typescriptCandidates = [
  join(anviaRoot, 'node_modules', 'typescript', 'lib', 'typescript.js'),
  join(anviaRoot, 'packages', 'core', 'node_modules', 'typescript', 'lib', 'typescript.js'),
]
const typescriptPath = typescriptCandidates.find(existsSync)

if (typescriptPath === undefined) {
  throw new Error(
    `TypeScript was not found under ${anviaRoot}. Set ANVIA_REPO to the RC checkout and install its dependencies.`,
  )
}

const typescriptModule = await import(pathToFileURL(typescriptPath).href)
const ts = typescriptModule.default ?? typescriptModule

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
  if (!packageName) return undefined
  const packageInfo = packages.get(packageName)
  const exportKey = moduleName === packageName ? '.' : `.${moduleName.slice(packageName.length)}`
  const exported = packageInfo.manifest.exports?.[exportKey]
  const typesPath = typeof exported === 'string' ? exported : exported?.types
  if (!typesPath) return undefined
  const entryPath = resolve(packageInfo.directory, typesPath)
  return existsSync(entryPath) ? entryPath : undefined
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
const markdownFiles = await collectFiles(docsRoot, (path) => path.endsWith('.md'))
const virtualSources = new Map()
const sourceMetadata = new Map()

for (const markdownPath of markdownFiles) {
  const markdown = await readFile(markdownPath, 'utf8')
  for (const [blockIndex, block] of codeBlocks(markdown).entries()) {
    if (!block.code.includes('@anvia/')) continue
    const virtualPath = join(
      docsRoot,
      '.snippet-types',
      `${relative(docsRoot, markdownPath).replaceAll('/', '__')}.${blockIndex}.tsx`,
    )
    virtualSources.set(virtualPath, block.code)
    sourceMetadata.set(virtualPath, {
      markdownPath,
      markdownLine: lineAt(markdown, block.offset),
    })
  }
}

const compilerOptions = {
  allowJs: false,
  jsx: ts.JsxEmit.ReactJSX,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  noImplicitAny: false,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
}
const host = ts.createCompilerHost(compilerOptions)
const defaultFileExists = host.fileExists.bind(host)
const defaultReadFile = host.readFile.bind(host)
host.fileExists = (path) => virtualSources.has(path) || defaultFileExists(path)
host.readFile = (path) => virtualSources.get(path) ?? defaultReadFile(path)
host.getSourceFile = (path, languageVersion) => {
  const virtual = virtualSources.get(path)
  if (virtual !== undefined) {
    return ts.createSourceFile(path, virtual, languageVersion, true, ts.ScriptKind.TSX)
  }
  const source = defaultReadFile(path)
  return source === undefined ? undefined : ts.createSourceFile(path, source, languageVersion, true)
}
host.resolveModuleNames = (moduleNames, containingFile) =>
  moduleNames.map((moduleName) => {
    if (moduleName.startsWith('@anvia/')) {
      const resolvedFileName = resolvePackageEntry(moduleName, packages)
      if (resolvedFileName !== undefined) {
        return { resolvedFileName, extension: ts.Extension.Dts, isExternalLibraryImport: true }
      }
    }
    return (
      ts.resolveModuleName(moduleName, containingFile, compilerOptions, host).resolvedModule ??
      ts.resolveModuleName(
        moduleName,
        join(anviaRoot, 'packages', 'core', 'src', 'index.ts'),
        compilerOptions,
        host,
      ).resolvedModule
    )
  })

const program = ts.createProgram([...virtualSources.keys()], compilerOptions, host)
const relevantCodes = new Set([
  2322, // assignment is not compatible
  2339, // property does not exist
  2345, // argument is not assignable
  2349, // value is not callable
  2351, // value is not constructable
  2353, // unknown object-literal property
  2551, // property does not exist (suggestion)
  2554, // wrong argument count
  2741, // required property is missing
  2769, // no overload matches
])
const failures = []

for (const diagnostic of ts.getPreEmitDiagnostics(program)) {
  if (!relevantCodes.has(diagnostic.code) || diagnostic.file === undefined) continue
  const metadata = sourceMetadata.get(diagnostic.file.fileName)
  if (metadata === undefined) continue
  const position = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
  const location = `${relative(docsRoot, metadata.markdownPath)}:${metadata.markdownLine + position.line}`
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')
  // Code-group files are checked as independent fences. Imports from their sibling
  // virtual files resolve to `unknown`, which is not evidence of an Anvia API mismatch.
  if (diagnostic.code === 2339 && message.endsWith("on type 'unknown'.")) continue
  failures.push(`${location}: TS${diagnostic.code} ${message}`)
}

if (failures.length > 0) {
  console.error(failures.sort().join('\n'))
  console.error(`\n${failures.length} API-shape diagnostics across ${virtualSources.size} Anvia snippets.`)
  process.exitCode = 1
} else {
  console.log(`Type-checked ${virtualSources.size} Anvia snippets with no API-shape diagnostics.`)
}
