/*jshint node:true*/

'use strict';

module.exports = function (grunt) {

    require('load-grunt-config')(grunt, {
      data : {
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

        grunt.task.run(['_dev'])

    })

}
