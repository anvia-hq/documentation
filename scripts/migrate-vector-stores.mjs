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

const adapters = new Map([
  ['ChromaVectorStore', { client: 'ChromaVectorClient', clientKeys: new Set(['client', 'path']) }],
  ['LanceDBVectorStore', { client: 'LanceDBVectorClient', clientKeys: new Set(['client', 'uri']) }],
  ['MilvusVectorStore', { client: 'MilvusVectorClient', clientKeys: new Set(['client', 'address', 'token']) }],
  ['PgVectorStore', { client: 'PgVectorClient', clientKeys: new Set(['client', 'connectionString']) }],
  ['PineconeVectorStore', { client: 'PineconeVectorClient', clientKeys: new Set(['client', 'apiKey']) }],
  ['QdrantVectorStore', { client: 'QdrantVectorClient', clientKeys: undefined }],
  ['RedisVectorStore', { client: 'RedisVectorClient', clientKeys: new Set(['client', 'url']) }],
  ['WeaviateVectorStore', {
    client: 'WeaviateVectorClient',
    clientKeys: new Set(['client', 'httpHost', 'httpPort', 'httpSecure', 'grpcHost', 'grpcPort', 'grpcSecure']),
  }],
])
const storeKeys = new Set([
  'collectionName', 'tableName', 'indexName', 'namespace', 'vectorSize', 'dimensions',
  'distance', 'metric', 'metadata', 'configuration', 'spec', 'keyPrefix', 'metadataSchema',
  'denseVectorName', 'sparseVectorName', 'hybrid', 'mode',
])

let changedFiles = 0
let changedFences = 0

for (const file of await collectMarkdown(docsRoot)) {
  const original = await readFile(file, 'utf8')
  const updated = original.replace(/```(?:ts|typescript)([^\n]*)\n([\s\S]*?)```/g, (fence, meta, code) => {
    if (!/(VectorStore\.connect|\.upsertDocuments\(|\.addDocuments\(|\.index\([^)]*\)\.search\()/.test(code)) return fence
    const source = ts.createSourceFile('snippet.ts', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
    const connectedClasses = new Set()
    for (const className of adapters.keys()) {
      if (new RegExp(`\\b${className}\\s*\\.\\s*connect\\s*\\(`).test(code)) connectedClasses.add(className)
    }
    let needsRetrieveImport = false
    let transformed = false

    const result = ts.transform(source, [context => {
      const visit = node => {
        if (ts.isSourceFile(node)) {
          const statements = []
          for (const statement of node.statements) {
            const connection = connectionStatement(statement)
            if (connection) {
              transformed = true
              connectedClasses.add(connection.className)
              statements.push(...connection.statements)
            } else {
              statements.push(ts.visitNode(statement, visit))
            }
          }
          if (needsRetrieveImport && !hasRetrieveImport(statements)) {
            statements.unshift(ts.factory.createImportDeclaration(
              undefined,
              ts.factory.createImportClause(false, undefined, ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('retrieveDocuments')),
              ])),
              ts.factory.createStringLiteral('@anvia/core/vector-store'),
            ))
          }
          return ts.factory.updateSourceFile(node, statements)
        }

        if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
          const bindings = node.importClause?.namedBindings
          if (bindings && ts.isNamedImports(bindings)) {
            const elements = bindings.elements.map(element => {
              const imported = (element.propertyName ?? element.name).text
              const adapter = adapters.get(imported)
              if (!adapter || !connectedClasses.has(imported)) return element
              transformed = true
              return ts.factory.updateImportSpecifier(
                element,
                element.isTypeOnly,
                undefined,
                ts.factory.createIdentifier(adapter.client),
              )
            })
            return ts.factory.updateImportDeclaration(
              node,
              node.modifiers,
              ts.factory.updateImportClause(
                node.importClause,
                node.importClause.isTypeOnly,
                node.importClause.name,
                ts.factory.updateNamedImports(bindings, elements),
              ),
              node.moduleSpecifier,
              node.attributes,
            )
          }
        }

        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          (node.expression.name.text === 'upsertDocuments' || node.expression.name.text === 'addDocuments')
        ) {
          const documents = node.arguments[0]
          if (documents) {
            transformed = true
            const properties = [ts.factory.createPropertyAssignment('documents', documents)]
            if (node.arguments[1]) properties.push(ts.factory.createPropertyAssignment('providerOptions', node.arguments[1]))
            return ts.factory.updateCallExpression(
              node,
              ts.factory.updatePropertyAccessExpression(node.expression, node.expression.expression, 'upsert'),
              node.typeArguments,
              [ts.factory.createObjectLiteralExpression(properties, true)],
            )
          }
        }

        const search = chainedIndexCall(node, 'search')
        if (search) {
          transformed = true
          needsRetrieveImport = true
          const options = objectProperties(search.operation.arguments[0], true)
          return ts.factory.createCallExpression(ts.factory.createIdentifier('retrieveDocuments'), undefined, [
            ts.factory.createObjectLiteralExpression([
              ts.factory.createPropertyAssignment('store', search.store),
              ts.factory.createPropertyAssignment('model', search.index.arguments[0]),
              ...options,
            ], true),
          ])
        }

        const inspect = chainedIndexCall(node, 'inspect')
        if (inspect) {
          transformed = true
          return ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(inspect.store, 'inspect'),
            undefined,
            inspect.operation.arguments,
          )
        }

        return ts.visitEachChild(node, visit, context)
      }

      function connectionStatement(statement) {
        if (!ts.isVariableStatement(statement) || statement.declarationList.declarations.length !== 1) return undefined
        const declaration = statement.declarationList.declarations[0]
        if (!ts.isIdentifier(declaration.name)) return undefined
        const call = unwrapAwait(declaration.initializer)
        if (
          !call || !ts.isCallExpression(call) || !ts.isPropertyAccessExpression(call.expression) ||
          call.expression.name.text !== 'connect' || !ts.isIdentifier(call.expression.expression)
        ) return undefined
        const className = call.expression.expression.text
        const adapter = adapters.get(className)
        if (!adapter) return undefined
        const options = call.arguments[0]
        if (!options || !ts.isObjectLiteralExpression(options)) return undefined

        const clientProperties = []
        const storeProperties = []
        let ensureMethod = 'ensure'
        for (const property of options.properties) {
          if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) {
            storeProperties.push(property)
            continue
          }
          const key = property.name.getText(source).replace(/^['"]|['"]$/g, '')
          const initializer = ts.isShorthandPropertyAssignment(property) ? property.name : property.initializer
          if (key === 'createIfMissing') {
            if (initializer.kind === ts.SyntaxKind.FalseKeyword) ensureMethod = 'validate'
            continue
          }
          if ((adapter.clientKeys && adapter.clientKeys.has(key)) || (!adapter.clientKeys && !storeKeys.has(key))) {
            clientProperties.push(property)
          } else {
            storeProperties.push(renameStoreProperty(property, key, initializer))
          }
        }
        if (!storeProperties.some(property => propertyName(property) === 'dimensions')) {
          storeProperties.push(ts.factory.createPropertyAssignment(
            'dimensions',
            ts.factory.createNonNullExpression(
              ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('embeddings'), 'dimensions'),
            ),
          ))
        }

        const storeName = declaration.name.text
        const clientName = ts.factory.createIdentifier(`${storeName}Client`)
        const clientDeclaration = ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
          ts.factory.createVariableDeclaration(
            clientName,
            undefined,
            undefined,
            ts.factory.createNewExpression(ts.factory.createIdentifier(adapter.client), undefined, [
              ts.factory.createObjectLiteralExpression(clientProperties, true),
            ]),
          ),
        ], ts.NodeFlags.Const))
        const storeDeclaration = ts.factory.createVariableStatement(undefined, ts.factory.createVariableDeclarationList([
          ts.factory.createVariableDeclaration(
            declaration.name,
            undefined,
            undefined,
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(clientName, 'vectorStore'),
              call.typeArguments,
              [ts.factory.createObjectLiteralExpression(storeProperties, true)],
            ),
          ),
        ], ts.NodeFlags.Const))
        const ensure = ts.factory.createExpressionStatement(ts.factory.createAwaitExpression(
          ts.factory.createCallExpression(ts.factory.createPropertyAccessExpression(declaration.name, ensureMethod), undefined, []),
        ))
        return { className, statements: [clientDeclaration, storeDeclaration, ensure] }
      }

      return root => ts.visitNode(root, visit)
    }])

    if (!transformed) {
      result.dispose()
      return fence
    }
    const printed = printer.printFile(result.transformed[0]).trimEnd()
    result.dispose()
    changedFences += 1
    return `\`\`\`ts${meta}\n${printed}\n\`\`\``
  })

  if (updated !== original) {
    await writeFile(file, updated)
    changedFiles += 1
  }
}

console.log(`Migrated ${changedFences} vector-store snippets in ${changedFiles} files.`)

function unwrapAwait(node) {
  if (!node) return undefined
  return ts.isAwaitExpression(node) ? node.expression : node
}

function propertyName(property) {
  if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) return undefined
  if (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) || ts.isNumericLiteral(property.name)) return property.name.text
  return undefined
}

function renameStoreProperty(property, key, initializer) {
  let name = property.name
  let value = initializer
  if (key === 'vectorSize') name = ts.factory.createIdentifier('dimensions')
  if (key === 'distance') {
    name = ts.factory.createIdentifier('metric')
    if (ts.isStringLiteral(initializer)) {
      const metrics = {
        Cosine: 'cosine', COSINE: 'cosine', cosine: 'cosine',
        Dot: 'dotProduct', IP: 'dotProduct', dotproduct: 'dotProduct', innerProduct: 'dotProduct',
        Euclid: 'euclidean', L2: 'euclidean', l2: 'euclidean', euclidean: 'euclidean',
      }
      value = ts.factory.createStringLiteral(metrics[initializer.text] ?? initializer.text)
    }
  }
  if (key === 'hybrid') {
    name = ts.factory.createIdentifier('mode')
    value = initializer.kind === ts.SyntaxKind.TrueKeyword
      ? ts.factory.createStringLiteral('hybrid')
      : ts.factory.createStringLiteral('dense')
  }
  return ts.factory.createPropertyAssignment(name, value)
}

function chainedIndexCall(node, operationName) {
  if (!ts.isCallExpression(node) || !ts.isPropertyAccessExpression(node.expression) || node.expression.name.text !== operationName) return undefined
  const index = node.expression.expression
  if (!ts.isCallExpression(index) || !ts.isPropertyAccessExpression(index.expression) || index.expression.name.text !== 'index' || index.arguments.length !== 1) return undefined
  return { operation: node, index, store: index.expression.expression }
}

function objectProperties(argument, renameThreshold) {
  if (!argument) return []
  if (!ts.isObjectLiteralExpression(argument)) return [ts.factory.createSpreadAssignment(argument)]
  return argument.properties.map(property => {
    if (!renameThreshold || !ts.isPropertyAssignment(property) || property.name.getText() !== 'threshold') return property
    return ts.factory.createPropertyAssignment('minScore', property.initializer)
  })
}

function hasRetrieveImport(statements) {
  return statements.some(statement =>
    ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) &&
    statement.moduleSpecifier.text === '@anvia/core/vector-store' &&
    ts.isNamedImports(statement.importClause?.namedBindings) &&
    statement.importClause.namedBindings.elements.some(element => (element.propertyName ?? element.name).text === 'retrieveDocuments'),
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
