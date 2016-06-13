'use strict'

var webpack = require('webpack')
var path = require('path')

module.exports = {
  entry: {
    'radio-player': ['main']
  },
  output: {
    path: path.join(__dirname, 'dist/scripts'),
    filename: '[name].min.js'
  },
  externals: {
    jquery: 'jQuery'
  },
  module: {
    loaders: [
      { test: /\.jade$/, loader: 'jade' },
      { test: /\.json$/, loader: 'json' }
    ]
  },
  resolve: {
    modulesDirectories: [
      'node_modules',
      path.join(__dirname, 'app/modules')
    ]
  },
  node: {
    process: false,
    Buffer: false,
    setImmediate: false
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: false,
      mangle: true,
      output: {
        comments: false
      },
      compress: {
        warnings: false
      }
    })
  ]
}
