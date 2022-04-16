const Compiler = require('./Compiler')
const NodeEnvironmentPlugin = require('./node/NodeEnvironmentPlugin')
const WebpackOptionsApply = require('./WebpackOptionsApply')

const webpack = function (options) {
  // 实例化 compiler 对象
  const compiler = new Compiler(options.context)

  compiler.options = options

  // 初始化 NodeEnvironmentPlugin（让 compiler 具备文件读写能力）
  new NodeEnvironmentPlugin().apply(compiler)

  // 挂载所有的 plugins 插件至 compiler 身上
  if (options.plugins && Array.isArray(options.plugins)) {
    for (const plugin of options.plugins) {
      plugin.apply(compiler)
    }
  }

  // 挂载所有 webpack 内置的插件（入口）
  compiler.options = new WebpackOptionsApply().process(options, compiler) 

  // 返回 compiler 对象
  return compiler
}

module.exports = webpack