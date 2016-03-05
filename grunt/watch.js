module.exports = {
  options : {
    spawn: false,
    livereload: '<%= connect.options.livereload %>'
  },
  gruntfile: {
    files: ['Gruntfile.js']
  },
  less: {
    files: ['<%= config.app %>/less/{,*/}*.less'],
    tasks: [
      'less',
      'autoprefixer'
    ]
  },
  jade: {
      files: ['<%= config.app %>/**/*.jade'],
      tasks: ['jade']
  },
  javascript: {
    files: [
      '<%= config.dist %>/scripts/{,*/}*.js'
    ]
  }
}
