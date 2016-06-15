'use strict'

var $ = require('jquery')
var progressbar = require('./progressbar')
require('./plugin')

// require('./disc-player')
// $('.Player').discPlayer()

var template = require('./templates/tracks.jade')

var data = require('./fixtures/videos.json')
var $video = $('#video')
var $toggle = $('#toggle')
var $progress = $('.js-progress')
var $stdout = $('.js-stdout')
var bar = progressbar($progress)

$video.jukebox({
  tracks: data.tracks,
  progress: function (p) {
    bar.slide(p.progress)
  }
})

var jukebox = $video.data('plugin-jukebox')
jukebox.on('state', function (state) {
  $stdout.html(state)
})

$toggle.click(jukebox.toggle)

bar.on('change', function (v) {
  jukebox.search(v.progress)
})

$progress.on('change', function () {
  jukebox.search(this.value)
})

jukebox.on('cued', function (track) {
  bar.pips(jukebox.disc().composition())
  $('.js-track').removeClass('+light')
  $('#js-track-' + track.idx).addClass('+light')
})

var $output = $('.js-output')
$output.html(template({ tracks: data.tracks }))

$('.js-track').click(function (evt) {
  var idx = $(this).data().trackIdx
  jukebox.tune(idx)
  evt.preventDefault()
})

var Gemini = require('gemini-scrollbar')
new Gemini({
  element: document.querySelector('.js-gemini'),
  autoshow: true
}).create()
