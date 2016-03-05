
var webpackConfig = require('../webpack.config.js')

module.exports = {
  dev: Object.assign({}, webpackConfig, {
    watch: true,
    stats: {
      colors: true,
      modules: true,
      reasons: false
    },
    devtool: 'eval'
  }),
  build: webpackConfig
}
