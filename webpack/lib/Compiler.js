const {
  Tapable,
  AsyncSeriesHook,
  SyncBailHook,
  AsyncParallelHook,
  SyncHook
} = require('tapable')
const path = require('path')
const mkdirp = require('mkdirp')

const NormalModuleFactory = require('./NormalModuleFactory')
const Compilation = require('./Compilation')
const Stats = require('./Stats')

class Compiler extends Tapable {
  constructor(context) {
    super()

    this.context = context

    this.hooks = {
      done: new AsyncSeriesHook(['stats']),
      entryOption: new SyncBailHook(['context', 'entry']),

      beforeRun: new AsyncSeriesHook(['compiler']),
      run: new AsyncSeriesHook(['compiler']),

      thisCompilation: new SyncHook(['compilation', 'params']),
      compilation: new SyncHook(['compilation', 'params']),

      beforeCompile: new AsyncSeriesHook(['params']),
      compile: new SyncHook('params'),
      make: new AsyncParallelHook(['compilation']),
      afterCompile: new AsyncSeriesHook(['compilation']),

      emit: new AsyncSeriesHook(['compilation']),
    }
  }

  emitAssets(compilation, callback) {
    const emitFiles = err => {
      const { assets } = compilation

      const outputPath = this.options.output.path

      for (const file in assets) {
        const source = assets[file]
        const targetPath = path.posix.join(outputPath, file)

        this.outputFileSystem.writeFileSync(targetPath, source, 'utf-8')
      }

      callback(err)
    }

    this.hooks.emit.callAsync(compilation, err => {
      mkdirp.sync(this.options.output.path)

      emitFiles(callback)
    })
  }

  run(callback) {
    console.log('run !!!')

    const finalCallback = (err, stats) => {
      callback(err, stats)
    }

    const onCompiled = (err, compilation) => {
      console.log('onCompiled !!!')

      this.emitAssets(compilation, () => {
        finalCallback(err, new Stats(compilation))
      })
    }

    this.hooks.beforeRun.callAsync(this, err => {
      if (err) {
        console.log(err)

        return
      }

      this.hooks.run.callAsync(this, err => {
        this.compile(onCompiled)
      })
    })
  }

  compile(callback) {
    const params = this.newCompilationParams()

    this.hooks.beforeCompile.callAsync(params, err => {
      this.hooks.compile.call(params)

      const compilation = this.newCompilationParams(params)

      this.hooks.make.callAsync(compilation, err => {
        compilation.seal(err => {
          this.hooks.afterCompile.callAsync(compilation, err => {
            callback(err, compilation)
          })
        })
      })
    })
  }

  newCompilationParams() {
    const params = {
      normalModuleFactory: new NormalModuleFactory()
    }

    return params
  }

  newCompilationParams(params) {
    const compilation = this.createComilation()

    this.hooks.thisCompilation.call(compilation, params)
    this.hooks.compilation.call(compilation, params)

    return compilation
  }

  createComilation() {
    return new Compilation(this)
  }
}

module.exports = Compiler