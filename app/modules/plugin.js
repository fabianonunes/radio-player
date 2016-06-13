'use strict'

var $ = require('jquery')
var pluginify = require('pluginify')

var jukebox = require('./jukebox')
var discr = require('./disc.js')

var defaults = {
  currentTrack: 0,
  tracks: []
}

var factory = function (el, opts) {
  var $mediaElement = el instanceof $ ? el : $(el)
  opts = $.extend({}, defaults, opts, $mediaElement.data())

  var jkbx = jukebox($mediaElement)
  var disc = discr(opts)

  jkbx.point(disc)

  return jkbx
}

// var template = require('./templates/tracks.jade')
// var data = require('./fixtures/videos.json')
// var $video = $('#video')
// var $output = $('.js-output')
// var $goto = $('#goto')
// $output.html(template({ tracks: data.tracks }))

pluginify('jukebox', factory)
module.exports = factory
