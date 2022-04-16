const EntryOptionPlugin = require('./EntryOptionPlugin')

class WebpackOptionsApply {
  process(options, compiler) {
    new EntryOptionPlugin().apply(compiler)

    compiler.hooks.entryOption.call(options.context, options.entry)

    return options
  }
}

module.exports = WebpackOptionsApply