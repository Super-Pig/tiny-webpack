const fs = require('fs')
const path = require('path')

class ClearWebpackPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('ClearWebpackPlugin', (compiler, callback) => {
      fs.rmdir(compiler.options.output.path, {
        recursive: true
      }, callback)
    })
  }
}

module.exports = ClearWebpackPlugin