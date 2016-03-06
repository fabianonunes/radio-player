'use strict'

var progress = require('./progressbar')
var $ = require('jquery')

var p = progress($('.Progress')[0])

p.on('change', function (value) {
  console.log(value)
})
