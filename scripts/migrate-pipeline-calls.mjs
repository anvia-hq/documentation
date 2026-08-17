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

function propertyName(property) {
  const name = property.name
  return name && (ts.isIdentifier(name) || ts.isStringLiteral(name)) ? name.text : undefined
}

function hasProperty(object, name) {
  return ts.isObjectLiteralExpression(object) && object.properties.some((property) => propertyName(property) === name)
}

function metadataProperties(options, id) {
  if (options && ts.isObjectLiteralExpression(options)) {
    if (hasProperty(options, 'id')) return [...options.properties]
    return [ts.factory.createPropertyAssignment('id', ts.factory.createStringLiteral(id)), ...options.properties]
  }
  return [ts.factory.createPropertyAssignment('id', ts.factory.createStringLiteral(id))]
}

function contextParameter(inputName = 'input') {
  return ts.factory.createParameterDeclaration(
    undefined,
    undefined,
    ts.factory.createObjectBindingPattern([
      ts.factory.createBindingElement(undefined, ts.factory.createIdentifier('input'), inputName),
    ]),
  )
}

function stageRunner(runner) {
  if (ts.isArrowFunction(runner) && runner.parameters.length === 1 && ts.isIdentifier(runner.parameters[0].name)) {
    return ts.factory.updateArrowFunction(
      runner,
      runner.modifiers,
      runner.typeParameters,
      [contextParameter(runner.parameters[0].name)],
      runner.type,
      runner.equalsGreaterThanToken,
      runner.body,
    )
  }
  return ts.factory.createArrowFunction(
    undefined,
    undefined,
    [contextParameter()],
    undefined,
    undefined,
    ts.factory.createCallExpression(runner, undefined, [ts.factory.createIdentifier('input')]),
  )
}

function migrateSource(sourceFile) {
  const counters = { step: 0, compose: 0, parallel: 0, agent: 0 }
  let changes = 0

  const result = ts.transform(sourceFile, [
    (context) => {
      const visit = (node) => {
        const visited = ts.visitEachChild(node, visit, context)
        if (!ts.isCallExpression(visited) || !ts.isPropertyAccessExpression(visited.expression)) return visited

        const method = visited.expression.name.text
        const [first, second] = visited.arguments

        if (method === 'step' && first && !hasProperty(first, 'run')) {
          counters.step += 1
          const properties = metadataProperties(second, `step-${counters.step}`)
          properties.push(ts.factory.createPropertyAssignment('run', stageRunner(first)))
          changes += 1
          return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
            ts.factory.createObjectLiteralExpression(properties, true),
          ])
        }

        if (method === 'use' && first) {
          counters.compose += 1
          const properties = metadataProperties(second, `compose-${counters.compose}`)
          properties.push(ts.factory.createPropertyAssignment('pipeline', first))
          changes += 1
          const expression = ts.factory.updatePropertyAccessExpression(
            visited.expression,
            visited.expression.expression,
            'compose',
          )
          return ts.factory.updateCallExpression(visited, expression, visited.typeArguments, [
            ts.factory.createObjectLiteralExpression(properties, true),
          ])
        }

        if (method === 'parallel' && first && !hasProperty(first, 'branches')) {
          counters.parallel += 1
          const properties = metadataProperties(second, `parallel-${counters.parallel}`)
          properties.push(ts.factory.createPropertyAssignment('branches', first))
          changes += 1
          return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
            ts.factory.createObjectLiteralExpression(properties, true),
          ])
        }

        if (method === 'agent' && first && !hasProperty(first, 'agent')) {
          counters.agent += 1
          const properties = metadataProperties(second, `agent-${counters.agent}`)
          properties.push(ts.factory.createPropertyAssignment('agent', first))
          properties.push(ts.factory.createPropertyAssignment('approval', ts.factory.createStringLiteral('reject')))
          properties.push(
            ts.factory.createMethodDeclaration(
              undefined,
              undefined,
              'request',
              undefined,
              undefined,
              [contextParameter()],
              undefined,
              ts.factory.createBlock([
                ts.factory.createReturnStatement(
                  ts.factory.createObjectLiteralExpression([
                    ts.factory.createPropertyAssignment(
                      'prompt',
                      ts.factory.createCallExpression(ts.factory.createIdentifier('String'), undefined, [
                        ts.factory.createIdentifier('input'),
                      ]),
                    ),
                  ]),
                ),
              ], true),
            ),
          )
          changes += 1
          return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
            ts.factory.createObjectLiteralExpression(properties, true),
          ])
        }

        if (method === 'run' && first && !hasProperty(first, 'input') && (!second || ts.isObjectLiteralExpression(second))) {
          const properties = [ts.factory.createPropertyAssignment('input', first)]
          if (second) properties.push(...second.properties)
          changes += 1
          return ts.factory.updateCallExpression(visited, visited.expression, visited.typeArguments, [
            ts.factory.createObjectLiteralExpression(properties, true),
          ])
        }

        if (method === 'batch' && first && (!second || ts.isObjectLiteralExpression(second))) {
          const properties = [ts.factory.createPropertyAssignment('inputs', first)]
          if (second) properties.push(...second.properties)
          changes += 1
          const expression = ts.factory.updatePropertyAccessExpression(
            visited.expression,
            visited.expression.expression,
            'runBatch',
          )
          return ts.factory.updateCallExpression(visited, expression, visited.typeArguments, [
            ts.factory.createObjectLiteralExpression(properties, true),
          ])
        }

        return visited
      }
      return (node) => ts.visitNode(node, visit)
    },
  ])

  const transformed = result.transformed[0]
  const code = changes === 0 ? undefined : printer.printFile(transformed)
  result.dispose()
  return { code, changes }
}

let migratedCalls = 0
for (const markdownPath of await collectMarkdown(docsRoot)) {
  const markdown = await readFile(markdownPath, 'utf8')
  if (!markdown.includes('Pipeline')) continue

  const fence = /^```(?:ts|typescript|tsx|js|javascript)[^\n]*\n([\s\S]*?)^```\s*$/gm
  const replacements = []
  let match
  while ((match = fence.exec(markdown))) {
    const codeOffset = match.index + match[0].indexOf(match[1])
    const sourceFile = ts.createSourceFile(markdownPath, match[1], ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    const migration = migrateSource(sourceFile)
    if (migration.changes > 0) {
      replacements.push({ start: codeOffset, end: codeOffset + match[1].length, text: `${migration.code}\n` })
      migratedCalls += migration.changes
    }
  }

  if (replacements.length === 0) continue
  let migrated = markdown
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    migrated = `${migrated.slice(0, replacement.start)}${replacement.text}${migrated.slice(replacement.end)}`
  }
  await writeFile(markdownPath, migrated)
}

console.log(`Migrated ${migratedCalls} Pipeline calls to the RC API.`)
