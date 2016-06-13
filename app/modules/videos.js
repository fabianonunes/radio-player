'use strict'

var $ = require('jquery')
var audio = require('./audio')
var disc = require('./disc.js')

var template = require('./templates/tracks.jade')
var data = require('./fixtures/videos.json')

var $video = $('#video')
var $output = $('.js-output')
var $goto = $('#goto')

var component = audio($video)
var queue = disc(data)
queue.setTrack(3)

$output.html(template({ tracks: data.tracks }))

component.point(queue)
component.on('state', function (state) {
  console.log(state)
})

$goto.click(function () {
  component.search(0.5)
})
