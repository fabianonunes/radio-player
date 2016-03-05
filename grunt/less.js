module.exports = {
  options: {
    paths: ['./node_modules'],
    sourceMap: true,
    sourceMapRootpath: '../',
    sourceMapFileInline: true
  },
  base: {
    files: [{
      expand: true,
      cwd: '<%= config.app %>/less',
      src: '*.less',
      dest: '<%= config.dist %>/styles',
      ext: '.css'
    }]
  }
}
