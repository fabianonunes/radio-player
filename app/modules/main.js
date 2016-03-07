'use strict'

var progress = require('./progressbar')
var $ = require('jquery')

var p = progress($('.Progress')[0])

var audio = $('#test')[0]

var data = require('./data.json')

var track = require('./track')(data)

var player = require('./player')(audio, $)

player.point(track)

p.pipes(track.composition())

p.on('change', function (data) {
  player.search(data.progress)
})

var $text = $('#time')
player.on('progress', function (data) {
  p.setValue(data.progress, true)
  $text.text(data.progress)
})

p.on('adjust', function (data) {
  console.log(data)
})

$('#pause').on('click', player.pause)
$('#play').on('click', player.play)

