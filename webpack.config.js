'use strict'

var webpack = require('webpack')

module.exports = {
  entry: {
    'radio-player': ['main']
  },
  output: {
    path: __dirname + '/dist/scripts',
    filename: '[name].min.js'
  },
  externals: {
    // jquery : 'jQuery'
  },
  module: {
    loaders: [
      { test: /\.jade$/, loader: 'jade-loader' }
    ]
  },
  resolve: {
    modulesDirectories: [
      'node_modules',
      __dirname + '/app/modules'
    ]
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
