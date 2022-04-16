const {
  SyncHook,
  Tapable
} = require('tapable')

const ejs = require('ejs')
const async = require('neo-async')
const path = require('path')
const NormalModuleFactory = require('./NormalModuleFactory')
const Parser = require('./Parser')
const Chunk = require('./Chunk')

const normalModuleFactory = new NormalModuleFactory()
const parser = new Parser()

class Compilation extends Tapable {
  constructor(compiler) {
    super()

    this.compiler = compiler
    this.context = compiler.context
    this.options = compiler.options
    this.inputFileSystem = compiler.inputFileSystem
    this.outputFileSystem = compiler.outputFileSystem

    this.entries = []
    this.modules = []
    this.chunks = []
    this.assets = {}
    this.files = []

    this.hooks = {
      succeedModule: new SyncHook(['module']),
      seal: new SyncHook(),
      beforeChunks: new SyncHook(),
      afterChunks: new SyncHook()
    }
  }

  addEntry(context, entry, name, callback) {
    this._addModuleChain(context, entry, name, (err, module) => {
      callback(err, module)
    })
  }

  _addModuleChain(context, entry, name, callback) {
    const resource = path.posix.join(context, entry)

    this.createModule({
      name,
      context,
      rawRequest: entry,
      resource,
      moduleId: './' + path.relative(context, resource),
      parser
    }, (entryModule) => {
      this.entries.push(entryModule)
    }, callback)
  }

  /**
   * 创建模块
   * @param {*} data 
   * @param {*} doAddEntry 可选参数，在加载入口模块的时候，将入口模块的id 写入 this.entries
   * @param {*} callback 
   */
  createModule(data, doAddEntry, callback) {
    let module = normalModuleFactory.create(data)

    const afterBuild = (err, module) => {
      if (module.dependencies.length > 0) {
        this.processDependencies(module, err => {
          callback(err, module)
        })
      } else {
        callback(err, module)
      }
    }

    this.buildModule(module, afterBuild)

    doAddEntry && doAddEntry(module)
    this.modules.push(module)
  }

  buildModule(module, callback) {
    module.build(this, err => {
      this.hooks.succeedModule.call(module)

      callback(err, module)
    })
  }

  processDependencies(module, callback) {
    const dependencies = module.dependencies

    async.forEach(dependencies, (dependency, done) => {
      this.createModule({
        name: dependency.name,
        context: dependency.context,
        rawRequest: dependency.rawRequest,
        moduleId: dependency.moduleId,
        resource: dependency.resource,
        parser
      }, null, done)
    }, callback)
  }

  seal(callback) {
    this.hooks.seal.call()
    this.hooks.beforeChunks.call()

    for (const entryModule of this.entries) {
      const chunk = new Chunk(entryModule)

      this.chunks.push(chunk)

      chunk.modules = this.modules.filter(module => module.name === chunk.name)
    }

    this.hooks.afterChunks.call(this.chunks)

    this.createChunkAssets()

    callback()
  }

  createChunkAssets() {
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i]
      const filename = chunk.name + '.js'
      chunk.files.push(filename)

      const templatePath = path.posix.join(__dirname, 'template/main.ejs')
      const templateCode = this.inputFileSystem.readFileSync(templatePath, 'utf-8')
      const templateRender = ejs.compile(templateCode)

      const source = templateRender({
        entryModuleId: chunk.entryModule.moduleId,
        modules: chunk.modules
      })

      this.emitAssets(filename, source)
    }
  }

  emitAssets(filename, source) {
    this.assets[filename] = source
    this.files.push(filename)
  }
}

module.exports = Compilation