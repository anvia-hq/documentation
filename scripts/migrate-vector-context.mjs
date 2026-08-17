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

let changedFiles = 0
let changedCalls = 0

for (const file of await collectMarkdown(docsRoot)) {
  const original = await readFile(file, 'utf8')
  const updated = original.replace(/```(?:ts|typescript)([^\n]*)\n([\s\S]*?)```/g, (fence, meta, code) => {
    if (!/\bcreateContextIndex\s*(?:<[^>]+>)?\s*\(/.test(code)) return fence
    const source = ts.createSourceFile('snippet.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    let transformed = false
    const result = ts.transform(source, [context => {
      const visit = node => {
        if (ts.isIdentifier(node) && node.text === 'createContextIndex') {
          transformed = true
          return ts.factory.createIdentifier('createVectorContext')
        }
        if (
          ts.isCallExpression(node) && ts.isIdentifier(node.expression) &&
          node.expression.text === 'createContextIndex' && node.arguments.length >= 2
        ) {
          transformed = true
          changedCalls += 1
          const store = node.arguments[0]
          const options = node.arguments[1]
          const properties = [
            ts.factory.createPropertyAssignment('store', store),
            ts.factory.createPropertyAssignment('model', modelForStore(store)),
          ]
          if (ts.isObjectLiteralExpression(options)) {
            properties.push(...options.properties.map(property => {
              if (!ts.isPropertyAssignment(property) || property.name.getText(source) !== 'threshold') return property
              return ts.factory.createPropertyAssignment('minScore', property.initializer)
            }))
          } else {
            properties.push(ts.factory.createSpreadAssignment(options))
          }
          return ts.factory.updateCallExpression(
            node,
            ts.factory.createIdentifier('createVectorContext'),
            node.typeArguments,
            [ts.factory.createObjectLiteralExpression(properties, true)],
          )
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

console.log(`Migrated ${changedCalls} vector-context calls in ${changedFiles} files.`)

function modelForStore(store) {
  if (ts.isPropertyAccessExpression(store)) {
    return ts.factory.createPropertyAccessExpression(store.expression, 'embeddingModel')
  }
  return ts.factory.createIdentifier('embeddingModel')
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
