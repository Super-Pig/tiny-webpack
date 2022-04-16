const path = require('path')
const types = require('@babel/types')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default

class NormalModule {
  constructor(data) {
    this.name = data.name
    this.moduleId = data.moduleId
    this.context = data.context
    this.rawRequest = data.rawRequest
    this.parser = data.parser
    this.resource = data.resource
    this._source
    this._ast
    this.dependencies = []
  }

  build(compilation, callback) {
    this.doBuild(compilation, err => {
      this._ast = this.parser.parse(this._source)

      traverse(this._ast, {
        CallExpression: (nodePath) => {
          let { node } = nodePath

          if (node.callee.name === 'require') {
            const modulePath = node.arguments[0].value  // './title'

            // 获取当前被加载的模块名称
            let moduleName = modulePath.split(path.posix.sep).pop()

            // 当前我们的打包器只处理 js
            const extName = moduleName.indexOf('.') === -1 ? '.js' : ''

            moduleName += extName

            const depResource = path.posix.join(path.posix.dirname(this.resource), moduleName)
            const depModuleId = './' + path.relative(this.context, depResource)

            // 记录当前被依赖模块的信息，方便后续递归加载
            this.dependencies.push({
              name: this.name,
              context: this.context,
              rewRequest: moduleName,
              moduleId: depModuleId,
              resource: depResource
            })

            // 替换内容
            node.callee.name = '__webpack_require__'
            node.arguments = [types.stringLiteral(depModuleId)]
          }
        }
      })

      const { code } = generator(this._ast)

      this._source = code

      callback(err)
    })
  }

  doBuild(compilation, callback) {
    this.getSource(compilation, (err, source) => {
      this._source = source

      callback(err)
    })
  }

  getSource(compilation, callback) {
    compilation.inputFileSystem.readFile(this.resource, 'utf-8', callback)
  }
}

module.exports = NormalModule