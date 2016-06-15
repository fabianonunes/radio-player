'use strict'

var $ = require('jquery')
var pluginify = require('pluginify')

var jukebox = require('./jukebox')
var discr = require('./disc')

var defaults = {
  currentTrack: 0,
  tracks: []
}

var factory = function (el, opts) {
  var $mediaElement = el instanceof $ ? el : $(el)
  opts = $.extend({}, defaults, opts, $mediaElement.data())

  var jkbx = jukebox($mediaElement)
  var disc = discr(opts)

  setTimeout(function () {
    jkbx.point(disc, /* quiet */ true)
  }, 0)

  var progress = opts.progress
  if (progress) {
    jkbx.on('progress', progress)
  }

  return jkbx
}

pluginify('jukebox', factory)

module.exports = factory
