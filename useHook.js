// const { SyncHook, AsyncParallelHook } = require('tapable')

// const SyncHook = require('./SyncHook')
const AsyncParallelHook = require('./AsyncParallelHook')

// const hook = new SyncHook(['name', 'age'])

// hook.tap('fn1', function (name, age) {
//   console.log('fn1 -->', name, age)
// })

// hook.tap('fn2', function (name, age) {
//   console.log('fn2 -->', name, age)
// })


const hook = new AsyncParallelHook(['name', 'age'])

hook.tapAsync('fn1', function (name, age, callback) {
  console.log('fn1 -->', name, age)
  callback()
})

hook.tapAsync('fn2', function (name, age, callback) {
  console.log('fn2 -->', name, age)
  callback()
})

hook.callAsync('garry', '34', () => {
  console.log('end~~~')
})