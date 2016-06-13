'use strict'

var $ = require('jquery')
require('./plugin')

// require('./disc-player')
// $('.Player').discPlayer()

var template = require('./templates/tracks.jade')

var data = require('./fixtures/videos.json')
var $video = $('#video')
var $progress = $('#progress')

$video.jukebox({
  tracks: data.tracks
})

var jukebox = $video.data('plugin-jukebox')

jukebox.on('cued', function (track) {
  console.log('cued', track.idx)
})

jukebox.on('progress', function (data) {
  $progress.val(data.progress * 100)
})

var $output = $('.js-output')
// var $goto = $('#goto')
$output.html(template({ tracks: data.tracks }))
