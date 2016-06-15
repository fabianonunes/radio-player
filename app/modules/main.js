'use strict'

var $ = require('jquery')
var progressbar = require('./progressbar')
require('./plugin')

var data = require('./fixtures/videos.json')

var $video = $('#video')
var $toggle = $('#toggle')
var $progress = $('.js-progress')
var $stdout = $('.js-stdout')
var bar = progressbar($progress)

var Gemini = require('gemini-scrollbar')
new Gemini({
  element: document.querySelector('.js-gemini'),
  autoshow: true
}).create()

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
  // bar.pips(jukebox.disc().composition())
  $('.js-track').removeClass('+light')
  var item = $('#js-track-' + track.idx)
  item.addClass('+light')
  var container = item.closest('.gm-scroll-view')
  // if (!container.is(':hover')) {
  container.stop().animate({
    scrollTop: container.scrollTop() + item.offset().top - container.offset().top
  }, '300')
  // }
})

$('.js-track').click(function (evt) {
  var idx = $(this).data().trackIdx
  jukebox.tune(idx)
  evt.preventDefault()
})
