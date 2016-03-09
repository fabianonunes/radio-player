'use strict'

var progressbar = require('./progressbar')
var $ = require('jquery')

var data = require('./fixtures/brasil-regional.json')
var track = require('./track')(data)

var audio = $('#test')[0]
var progress = $('.Progress')[0]
var $text = $('#time')
var $state = $('#state')

var bar = progressbar(progress)
bar.disable()

var player = require('./player')(audio, $)

bar.on('change', function (data) {
  player.search(data.progress)
})

player.on('progress', function (data) {
  bar.setValue(data.progress, true)
  $text.text(data.progress)
})

player.on('cued', function () {
  bar.enable()
  bar.pipes(player.track().composition())
})

player.on('stop', bar.disable)

player.on('state', function (state) {
  $state.text(state + '...')
})

$('#pause').on('click', player.pause)
$('#play').on('click', player.play)
$('#point').on('click', player.point.bind(null, track))

