'use strict'

var progress = require('./progressbar')
var $ = require('jquery')

var p = progress($('.Progress')[0])

var audio = $('#test')[0]

var data = require('./data.json')

var track = require('./track')(data)

var player = require('./player')(audio, $)

player.point(track)

p.on('change', function (data) {
  player.search(data.progress)
})

player.on('progress', function (data) {
  p.setValue(data.progress, true)
})
