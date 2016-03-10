'use strict'

var _sortedIndex = require('lodash/sortedIndex')

module.exports = function (audio, margin) {
  var buf = audio.buffered
  var intervals = []
  for (var i = 0; i < buf.length; i++) {
    intervals.push([buf.start(i), buf.end(i)])
  }

  return intervals.some(function (interval) {
    return _sortedIndex(interval, audio.currentTime + (margin || 0)) === 1
  })
}
