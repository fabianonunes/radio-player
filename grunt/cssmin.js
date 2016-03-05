module.exports = {
  options: {
    keepSpecialComments: 0
  },
  dist: {
    files: [{
      expand: true,
      src: '<%= config.dist %>/styles/*.css'
    }]
  }
}
