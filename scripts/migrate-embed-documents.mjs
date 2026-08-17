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

const files = await collectMarkdown(docsRoot)
let changedFiles = 0
let changedCalls = 0

for (const file of files) {
  const original = await readFile(file, 'utf8')
  const updated = original.replace(/```(?:ts|typescript)([^\n]*)\n([\s\S]*?)```/g, (fence, meta, code) => {
    if (!/\bembedDocuments\s*\(/.test(code)) return fence
    const source = ts.createSourceFile('snippet.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    let transformed = false

    const result = ts.transform(source, [context => {
      const visit = node => {
        if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
          const call = unwrapEmbedDocumentsCall(node.initializer)
          if (call && call.arguments.length >= 2) {
            transformed = true
            changedCalls += 1
            const binding = ts.factory.createObjectBindingPattern([
              ts.factory.createBindingElement(
                undefined,
                node.name.text === 'documents' ? undefined : ts.factory.createIdentifier('documents'),
                node.name,
                undefined,
              ),
            ])
            return ts.factory.updateVariableDeclaration(
              node,
              binding,
              node.exclamationToken,
              node.type,
              replaceWrappedCall(node.initializer, call, objectCall(call)),
            )
          }
        }

        if (isEmbedDocumentsCall(node) && node.arguments.length >= 2) {
          transformed = true
          changedCalls += 1
          return objectCall(node)
        }
        return ts.visitEachChild(node, visit, context)
      }
      return root => ts.visitNode(root, visit)
    }])

    if (!transformed) {
      result.dispose()
      return fence
    }
    const printed = printer.printFile(result.transformed[0]).trimEnd()
    result.dispose()
    return `\`\`\`ts${meta}\n${printed}\n\`\`\``
  })

  if (updated !== original) {
    await writeFile(file, updated)
    changedFiles += 1
  }
}

console.log(`Migrated ${changedCalls} embedDocuments calls in ${changedFiles} files.`)

function isEmbedDocumentsCall(node) {
  return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'embedDocuments'
}

function unwrapEmbedDocumentsCall(node) {
  if (!node) return undefined
  if (isEmbedDocumentsCall(node)) return node
  if (ts.isAwaitExpression(node)) return unwrapEmbedDocumentsCall(node.expression)
  return undefined
}

function replaceWrappedCall(node, oldCall, nextCall) {
  if (node === oldCall) return nextCall
  if (ts.isAwaitExpression(node)) return ts.factory.updateAwaitExpression(node, replaceWrappedCall(node.expression, oldCall, nextCall))
  return node
}

function objectCall(call) {
  const [model, documents, options] = call.arguments
  const properties = [
    ts.factory.createPropertyAssignment('model', model),
    ts.factory.createPropertyAssignment('documents', documents),
  ]
  if (options) {
    if (ts.isObjectLiteralExpression(options)) properties.push(...options.properties)
    else properties.push(ts.factory.createSpreadAssignment(options))
  }
  return ts.factory.updateCallExpression(
    call,
    call.expression,
    call.typeArguments,
    [ts.factory.createObjectLiteralExpression(properties, true)],
  )
}

async function collectMarkdown(directory) {
  const paths = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.vitepress' || entry.name === 'scripts') continue
    const target = join(directory, entry.name)
    if (entry.isDirectory()) paths.push(...await collectMarkdown(target))
    else if (entry.isFile() && entry.name.endsWith('.md')) paths.push(target)
  }
  return paths
}
