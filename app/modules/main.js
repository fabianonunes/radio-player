'use strict'

var progress = require('./progressbar')
var $ = require('jquery')

var bar = progress($('.Progress')[0])

bar.on('change', function (data) {
  console.log(data)
})

var audio = $('#test')[0]
var data = require('./fixtures/brasil-regional.json')
var track = require('./track')(data)
var player = require('./player')(audio, $)

player.on('tiago', function (data) {
  alert('olá')
  alert(data)
})

player.on('tiago', function (data) {
  alert('alô')
  alert(data)
})

bar.pipes(track.composition())

bar.on('change', function (data) {
  player.search(data.progress)
})

var $text = $('#time')
var $state = $('#state')
player.on('progress', function (data) {
  bar.setValue(data.progress, true)
  $text.text(data.progress)
})
player.on('state', function (state) {
  $state.text(state + '...')
})

$('#pause').on('click', player.pause)
$('#play').on('click', player.play)
$('#point').on('click', player.point.bind(null, track))

