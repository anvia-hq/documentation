import { existsSync } from 'node:fs'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anviaRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const typescriptCandidates = [
  join(anviaRoot, 'node_modules', 'typescript', 'lib', 'typescript.js'),
  join(anviaRoot, 'packages', 'core', 'node_modules', 'typescript', 'lib', 'typescript.js'),
]
const typescriptPath = typescriptCandidates.find(existsSync)
if (typescriptPath === undefined) throw new Error(`TypeScript was not found under ${anviaRoot}`)

const typescriptModule = await import(pathToFileURL(typescriptPath).href)
const ts = typescriptModule.default ?? typescriptModule
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })

async function collectMarkdown(directory) {
  const paths = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.vitepress') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) paths.push(...(await collectMarkdown(path)))
    else if (path.endsWith('.md')) paths.push(path)
  }
  return paths
}

function isProcessEnvAccess(node) {
  return (
    ts.isPropertyAccessExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.expression) &&
    node.expression.expression.text === 'process' &&
    node.expression.name.text === 'env'
  )
}

function propertyName(property) {
  return ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
    ? property.name.text
    : undefined
}

function migrateBlock(code, filename) {
  const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const openAIClientNames = new Set()
  const openAIInstances = new Map()
  const replacements = []

  for (const statement of sourceFile.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === '@anvia/openai' &&
      statement.importClause?.namedBindings &&
      ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      for (const element of statement.importClause.namedBindings.elements) {
        if ((element.propertyName ?? element.name).text === 'OpenAIClient') {
          openAIClientNames.add(element.name.text)
        }
      }
    }
  }

  function clientApi(newExpression) {
    const options = newExpression.arguments?.[0]
    if (!options || !ts.isObjectLiteralExpression(options)) return 'responses'
    return options.properties.some(
      (property) => ts.isPropertyAssignment(property) && propertyName(property) === 'baseUrl',
    )
      ? 'chat'
      : 'responses'
  }

  function collectInstances(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isNewExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      openAIClientNames.has(node.initializer.expression.text)
    ) {
      openAIInstances.set(node.name.text, clientApi(node.initializer))
    }
    ts.forEachChild(node, collectInstances)
  }
  collectInstances(sourceFile)

  function addReplacement(node, updated) {
    const printed = printer.printNode(ts.EmitHint.Unspecified, updated, sourceFile)
    const start = node.getStart(sourceFile)
    const lineStart = code.lastIndexOf('\n', start - 1) + 1
    const indentation = code.slice(lineStart, start).match(/^\s*/)?.[0] ?? ''
    replacements.push({
      start,
      end: node.getEnd(),
      text: printed.replaceAll('\n', `\n${indentation}`),
    })
  }

  function visit(node) {
    if (ts.isPropertyAssignment(node) && propertyName(node) === 'apiKey' && isProcessEnvAccess(node.initializer)) {
      addReplacement(
        node.initializer,
        ts.factory.createNonNullExpression(node.initializer),
      )
      return
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === 'completionModel' &&
      node.arguments.length === 1 &&
      ts.isObjectLiteralExpression(node.arguments[0]) &&
      !node.arguments[0].properties.some(
        (property) => ts.isPropertyAssignment(property) && propertyName(property) === 'api',
      )
    ) {
      const receiver = node.expression.expression
      let api
      if (ts.isIdentifier(receiver)) api = openAIInstances.get(receiver.text)
      else if (
        ts.isNewExpression(receiver) &&
        ts.isIdentifier(receiver.expression) &&
        openAIClientNames.has(receiver.expression.text)
      ) {
        api = clientApi(receiver)
      }
      if (api !== undefined) {
        const options = ts.factory.updateObjectLiteralExpression(node.arguments[0], [
          ...node.arguments[0].properties,
          ts.factory.createPropertyAssignment('api', ts.factory.createStringLiteral(api)),
        ])
        const updated = ts.factory.updateCallExpression(node, node.expression, node.typeArguments, [options])
        addReplacement(node, updated)
        return
      }
    }

    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  let migrated = code
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    migrated = `${migrated.slice(0, replacement.start)}${replacement.text}${migrated.slice(replacement.end)}`
  }
  return { code: migrated, count: replacements.length }
}

let changedBlocks = 0
let changedExpressions = 0
for (const markdownPath of await collectMarkdown(docsRoot)) {
  const markdown = await readFile(markdownPath, 'utf8')
  const fence = /^```(?:ts|typescript|tsx|js|javascript)[^\n]*\n([\s\S]*?)^```\s*$/gm
  const replacements = []
  let match
  while ((match = fence.exec(markdown))) {
    const codeOffset = match.index + match[0].indexOf(match[1])
    const migration = migrateBlock(match[1], markdownPath)
    if (migration.count === 0) continue
    replacements.push({ start: codeOffset, end: codeOffset + match[1].length, text: migration.code })
    changedBlocks += 1
    changedExpressions += migration.count
  }
  if (replacements.length === 0) continue
  let migrated = markdown
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    migrated = `${migrated.slice(0, replacement.start)}${replacement.text}${migrated.slice(replacement.end)}`
  }
  await writeFile(markdownPath, migrated)
}

console.log(`Updated ${changedExpressions} provider options across ${changedBlocks} code blocks.`)
