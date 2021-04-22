/*
 * @@Author: mingo.wang
 * @Date: 2020-10-13 20:06:37
 * @LastEditors: mingo.wang
 * @LastEditTime: 2021-04-22 11:51:44
 * @Description:
 * 自动导入 import { elementTracker } from 'xxx'
 * 统一在页面根节点外包裹<tag onClick={elementTracker}></tag>
 */
const { parse } = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const t = require('@babel/core').types

function createComponentImport() {
  const identifier = t.identifier('TrackWrapper')
  const importSpecifier = t.ImportSpecifier(identifier, identifier)
  const importDeclaration = t.importDeclaration(
    [importSpecifier],
    t.stringLiteral('taro-track')
  )
  return importDeclaration
}

const ReturnStatementVisitor = {
  /**
   * return <div></div>
   * =>
   * return <TrackWrapper><div></div></TrackWrapper>
   */
  JSXElement: (path) => {
    path.skip()
    const newElement = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('TrackWrapper'), [], false),
      t.jsxClosingElement(t.jsxIdentifier('TrackWrapper')),
      [t.cloneNode(path.node)],
      false
    )
    path.replaceWith(newElement)
    path.stop()
    return
  },
  /**
   * return a ? <div></div> : null
   * =>
   * return <TrackWrapper>{a ? <div></div> : null}</TrackWrapper>
   */
  ConditionalExpression: (path) => {
    path.skip()
    const newElement = t.jsxElement(
      t.jsxOpeningElement(t.jsxIdentifier('TrackWrapper'), [], false),
      t.jsxClosingElement(t.jsxIdentifier('TrackWrapper')),
      [t.JSXExpressionContainer(t.cloneNode(path.node))],
      false
    )
    path.replaceWith(newElement)
    path.stop()
    return
  },
}

/**
 * 通过 ExportDefault 找到真实组件名，再return处包装 <TrackWrapper>{children}</TrackWrapper>
 *
 * 目前考虑了三种情况
 * 1. export default Home
 * 2. export default connect(undefined, mapDispatchToProps)(Home)，获取最后一个参数作为组件名
 * 3. export default () => <div></div>
 *
 * 如果之后需要添加case，可以改在这里
 */

const programVisitor = {
  ExportDefaultDeclaration: (path) => {
    // export default Home
    if (t.isIdentifier(path.node.declaration)) {
      const name = path.node.declaration.name
      const parent =
        path.scope.getFunctionParent() || path.scope.getProgramParent()
      parent.path.traverse({
        'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (
          path,
        ) => {
          const VariableDeclarator = path.findParent((path) =>
            path.isVariableDeclarator()
          )
          if (VariableDeclarator && VariableDeclarator.node.id.name === name) {
            const rs = path.get('body.body').find((v) => t.isReturnStatement(v))
            rs && rs.traverse(ReturnStatementVisitor, { source: path, name })
            path.stop()
          }
        },
      })
    }
    // export default connect(undefined, mapDispatchToProps)(Home)
    else if (t.isCallExpression(path.node.declaration)) {
      path.traverse(
        {
          CallExpression: (path) => {
            if (path.node.arguments.length === 1) {
              const name = path.node.arguments.map((v) => v.name)[0]
              const parent =
                path.scope.getFunctionParent() || path.scope.getProgramParent()
              parent.path.traverse({
                'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (
                  path
                ) => {
                  const VariableDeclarator = path.findParent((path) =>
                    path.isVariableDeclarator()
                  )
                  if (
                    VariableDeclarator &&
                    VariableDeclarator.node.id.name === name
                  ) {
                    const rs = path
                      .get('body.body')
                      .find((v) => t.isReturnStatement(v))
                    rs &&
                      rs.traverse(ReturnStatementVisitor, {
                        source: path,
                        name,
                      })
                    path.stop()
                  }
                },
              })
              path.stop()
              return
            }
          },
        },
        { source: path }
      )
    } else if (t.isArrowFunctionExpression(path.node.declaration)) {
      path.skip()

      const rs = path.get('declaration')
      rs && rs.traverse(ReturnStatementVisitor, { source: path })
    } else {
      // export default () => <div></div>
      path.traverse({
        'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (
          path
        ) => {
          path.skip()
          const rs = path.get('body.body').find((v) => t.isReturnStatement(v))

          rs && rs.traverse(ReturnStatementVisitor, { source: path })
        },
      })
      path.stop()
      return
    }
  },
}

const trans = (content) => {
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  traverse(ast, {
    Program: {
      enter: (path) => {
        const importComponent = createComponentImport()
        path.unshiftContainer('body', importComponent)
        path.traverse(programVisitor)
      },
    },
  })
  const code = generator(ast).code
  return code
}

module.exports = trans
