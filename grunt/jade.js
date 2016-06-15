'use strict'

var path = require('path')

module.exports = {
  main: {
    options: {
      pretty: true,
      data: {
        require: function (modulePath) {
          return require(path.join('../app', modulePath))
        }
      }
    },
    files: [{
      expand: true,
      flatten: true,
      src: '<%= config.app %>/*.jade',
      dest: '<%= config.dist %>',
      ext: '.html'
    }]
  }
}
