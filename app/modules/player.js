'use strict'

var $ = require('jquery')

var progressbar = require('./progressbar')
var audioPlayer = require('./audio')
var discr = require('./disc')

module.exports = function ($el) {

  var $knob = $el.find('.Player-knob:first')
  var $audio = $el.find('audio:first')

  var ap = audioPlayer($audio)
  var bar = progressbar($('.Progress:first'))
  var disc = discr($el.data('disc'))

  bar.disable()
  bar.on('change', function (data) {
    ap.search(data.progress)
  })

  ap.on('progress', function (data) {
    bar.setValue(data.progress, true)
  })

  ap.on('cued', function () {
    bar.enable()
    bar.pipes(ap.disc().composition())
  })

  ap.on('stop', bar.disable)

  // ap.on('state', function (state) {
  //   $knob.state.text(state + '...')
  // })

  $knob.on('click', function () {
    ap.point(disc)
  })

}
