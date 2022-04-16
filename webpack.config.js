const path = require('path')
const ClearWebpackPlugin = require('./plugins/ClearWebpackPlugin')

module.exports = {
  context: process.cwd(),
  devtool: false,
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve('dist')
  },
  plugins: [new ClearWebpackPlugin()]
}