import { existsSync } from 'node:fs'
import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const docsRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const anviaRoot = resolve(process.env.ANVIA_REPO ?? join(docsRoot, '..', 'anvia'))
const typescriptPath = join(anviaRoot, 'node_modules', 'typescript', 'lib', 'typescript.js')
if (!existsSync(typescriptPath)) throw new Error(`TypeScript was not found at ${typescriptPath}`)

const typescriptModule = await import(pathToFileURL(typescriptPath).href)
const ts = typescriptModule.default ?? typescriptModule
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
const factoryNames = new Set([
  'completionModel',
  'embeddingModel',
  'imageGenerationModel',
  'speechGenerationModel',
  'transcriptionModel',
  'ocrModel',
])

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

function migratedArguments(call) {
  if (!ts.isPropertyAccessExpression(call.expression)) return
  if (!factoryNames.has(call.expression.name.text)) return
  if (call.arguments.length < 1 || call.arguments.length > 2) return

  const [modelId, options] = call.arguments
  if (ts.isObjectLiteralExpression(modelId)) return
  if (options && !ts.isObjectLiteralExpression(options)) return

  return [
    ts.factory.createObjectLiteralExpression(
      [ts.factory.createPropertyAssignment('modelId', modelId), ...(options?.properties ?? [])],
      true,
    ),
  ]
}

function migrateBlock(code, filename) {
  const sourceFile = ts.createSourceFile(filename, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const replacements = []

  function visit(node) {
    if (ts.isCallExpression(node)) {
      const argumentsArray = migratedArguments(node)
      if (argumentsArray) {
        const migrated = ts.factory.updateCallExpression(
          node,
          node.expression,
          node.typeArguments,
          argumentsArray,
        )
        const printed = printer.printNode(ts.EmitHint.Expression, migrated, sourceFile)
        const start = node.getStart(sourceFile)
        const lineStart = code.lastIndexOf('\n', start - 1) + 1
        const indentation = code.slice(lineStart, start).match(/^\s*/)?.[0] ?? ''
        replacements.push({
          start,
          end: node.getEnd(),
          text: printed.replaceAll('\n', `\n${indentation}`),
        })
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

let migratedCalls = 0
for (const markdownPath of await collectMarkdown(docsRoot)) {
  const markdown = await readFile(markdownPath, 'utf8')
  const fence = /^```(?:ts|typescript|tsx|js|javascript)[^\n]*\n([\s\S]*?)^```\s*$/gm
  const replacements = []
  let match

  while ((match = fence.exec(markdown))) {
    const codeOffset = match.index + match[0].indexOf(match[1])
    const migration = migrateBlock(match[1], markdownPath)
    if (migration.count > 0) {
      replacements.push({ start: codeOffset, end: codeOffset + match[1].length, text: migration.code })
      migratedCalls += migration.count
    }
  }

  if (replacements.length === 0) continue
  let migrated = markdown
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    migrated = `${migrated.slice(0, replacement.start)}${replacement.text}${migrated.slice(replacement.end)}`
  }
  await writeFile(markdownPath, migrated)
}

console.log(`Migrated ${migratedCalls} provider model factories to object-only options.`)
