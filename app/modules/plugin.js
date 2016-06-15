'use strict'

var $ = require('jquery')
var pluginify = require('pluginify')

var jukebox = require('./jukebox')
var discr = require('./disc')
var progressbar = require('./progressbar')

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
    var bar = progressbar(progress)
    jkbx.on('progress', function (p) {
      bar.slide(p.progress)
    })
    bar.on('change', function (p) {
      jkbx.search(p.progress)
    })
  }

  return jkbx
}

pluginify('jukebox', factory)

module.exports = factory
