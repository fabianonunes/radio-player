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

  jkbx.point(disc, /* quiet */ true)

  return jkbx
}

pluginify('jukebox', factory)

module.exports = factory
