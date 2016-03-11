'use strict'

var webpackConfig = require('../webpack.config.js')

module.exports = {
  options: webpackConfig,
  dev: {
    watch: true,
    stats: {
      colors: true,
      modules: true,
      reasons: false
    },
    devtool: 'eval',
    debug: true
  },
  build: {}
}
