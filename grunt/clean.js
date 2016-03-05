module.exports = {
  options: {
    force: true
  },
  dist: {
    files: [{
      dot: true,
      src: ['<%= config.dist %>']
    }]
  }
}
