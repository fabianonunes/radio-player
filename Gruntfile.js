/*jshint node:true*/

'use strict'

module.exports = function (grunt) {
  require('load-grunt-config')(grunt, {
    data: {
      config: {
        app: 'app',
        dist: 'dist',
        fonts: ['senado.css', 'bootstrap']
      }
    }
  })

  grunt.registerTask('dev', '--allow-remote para permitir acesso externo', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '*')
    }

    var port = parseInt(grunt.option('port'), 10)
    if (port) {
      grunt.config.set('connect.options.port', port)
      grunt.config.set('connect.options.livereload', port + 100)
    }
    grunt.task.run(['_dev'])
  })
}
