module.exports = {
  options: {
    browsers: [
      '> 1%',
      'last 2 versions',
      'ie 9'
    ],
    map: true
  },
  base: {
    files: [{
      expand: true,
      cwd: '<%= config.dist %>/styles',
      src: '{,*/}*.css',
      dest: '<%= config.dist %>/styles'
    }]
  }
}
