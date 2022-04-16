const Hook = require('./Hook')

class HookCodeFactory {
  setup(instance, options) {
    this.options = options

    instance._x = options.taps.map(o => o.fn)
  }

  args() {
    return this.options.args.join(',')
  }

  head() {
    return `var _x = this._x;`
  }

  content() {
    let code = ``

    for (let i = 0; i < this.options.taps.length; i++) {
      code += `
        var _fn${i} = _x[${i}];

        _fn${i}(${this.args()});
      `
    }

    return code
  }

  create(options) {
    let fn = new Function(
      this.args(),
      this.head() + this.content()
    )

    return fn
  }
}

let factory = new HookCodeFactory()

class SyncHook extends Hook {
  constructor(args) {
    super(args)
  }

  compile(options) {
    factory.setup(this, options)

    return factory.create(options)
  }
}

module.exports = SyncHook