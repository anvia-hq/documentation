import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const anviaRoot = process.env.ANVIA_REPO ?? path.resolve(root, '..', 'anvia')
const typescriptModule = await import(pathToFileURL(path.join(anviaRoot, 'node_modules/typescript/lib/typescript.js')).href)
const ts = typescriptModule.default ?? typescriptModule
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
const markdownFiles = []

walk(root)

let changedFiles = 0
let migratedSessions = 0
let migratedRuns = 0

for (const file of markdownFiles) {
  const original = fs.readFileSync(file, 'utf8')
  const agents = new Map()
  let updated = original.replace(/```(?:ts|typescript)([^\n]*)\n([\s\S]*?)```/g, (fence, meta, code) => {
    const source = ts.createSourceFile('snippet.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const replacements = []

    visit(source)

    function visit(node) {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        ts.isCallExpression(node.initializer) &&
        ts.isPropertyAccessExpression(node.initializer.expression) &&
        node.initializer.expression.name.text === 'session'
      ) {
        const agentExpression = node.initializer.expression.expression
        if (ts.isIdentifier(agentExpression) || ts.isPropertyAccessExpression(agentExpression)) {
          const sessionId = node.initializer.arguments[0]
          const options = node.initializer.arguments[1]
          if (sessionId) {
            const sessionName = node.name.text
            agents.set(sessionName, agentExpression.getText(source))
            const properties = options && ts.isObjectLiteralExpression(options)
              ? options.properties.map((property) => property.getText(source)).join(', ')
              : options
                ? `...(${options.getText(source)})`
                : ''
            replacements.push({
              start: node.initializer.getStart(source),
              end: node.initializer.end,
              text: `{ sessionId: ${sessionId.getText(source)}${properties ? `, ${properties}` : ''} }`,
            })
            migratedSessions += 1
          }
        }
      }

      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        agents.has(node.expression.expression.text) &&
        (node.expression.name.text === 'generate' || node.expression.name.text === 'stream')
      ) {
        const sessionName = node.expression.expression.text
        const argument = node.arguments[0]
        if (argument && ts.isObjectLiteralExpression(argument) && !argument.properties.some(
          (property) => ts.isPropertyAssignment(property) && property.name.getText(source) === 'session',
        )) {
          replacements.push({
            start: node.expression.getStart(source),
            end: node.expression.end,
            text: `${agents.get(sessionName)}.${node.expression.name.text}`,
          })
          replacements.push({
            start: argument.end - 1,
            end: argument.end - 1,
            text: `${argument.properties.length ? ',' : ''} session: ${sessionName}`,
          })
          migratedRuns += 1
        }
      }

      ts.forEachChild(node, visit)
    }

    if (replacements.length === 0) return fence
    const nonOverlapping = replacements
      .sort((a, b) => b.start - a.start)
      .filter((replacement, index, items) => !items.slice(0, index).some(
        (later) => replacement.start < later.end && replacement.end > later.start,
      ))
    let next = code
    for (const replacement of nonOverlapping) {
      next = next.slice(0, replacement.start) + replacement.text + next.slice(replacement.end)
    }
    return `\`\`\`ts${meta}\n${next}\`\`\``
  })

  updated = updated.replace(/```(?:ts|typescript)([^\n]*)\n([\s\S]*?)```/g, (fence, meta, code) => {
    if (!/,\s*session:\s*[A-Za-z_$]/.test(code)) return fence
    const source = ts.createSourceFile('snippet.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    return `\`\`\`ts${meta}\n${printer.printFile(source).trimEnd()}\n\`\`\``
  })

  if (updated !== original) {
    fs.writeFileSync(file, updated)
    changedFiles += 1
  }
}

console.log(`Migrated ${migratedSessions} session declarations and ${migratedRuns} session runs in ${changedFiles} files.`)

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'scripts') continue
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) walk(target)
    else if (entry.isFile() && entry.name.endsWith('.md')) markdownFiles.push(target)
  }
}
