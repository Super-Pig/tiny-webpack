const path = require('path')

module.exports = {
  context: process.cwd(),
  devtool: false,
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve('dist')
  }
}