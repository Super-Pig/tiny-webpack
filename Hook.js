class Hook {
  constructor(args = []) {
    this.args = args
    this.taps = []
    this._x = undefined
  }

  _insert(options) {
    this.taps[this.taps.length] = options
  }

  tap(options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options,
      }
    }

    options = Object.assign({ fn }, options)

    this._insert(options)
  }

  tapAsync(options, fn) {
    if (typeof options === 'string') {
      options = {
        name: options,
      }
    }

    options = Object.assign({ fn }, options)

    this._insert(options)
  }

  call(...args) {
    let callFn = this._createCall()

    return callFn.apply(this, args)
  }

  callAsync(...args) {
    let callFn = this._createCall()

    return callFn.apply(this, args)
  }

  _createCall() {
    return this.compile({
      taps: this.taps,
      args: this.args
    })
  }
}

module.exports = Hook