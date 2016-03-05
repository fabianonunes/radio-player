module.exports = {
  main: {
    options: {
      pretty: true
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
