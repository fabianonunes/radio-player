'use strict'

var _pluck = require('lodash/pluck')
var data = require('./data.json')

// trackSet.currentProgress(progress)
// trackSet.currentTrack
// trackSet.currentTrack.url
// trackSet.id
// trackSet.next()
// trackSet.rewind()
// trackSet.search(progress)

module.exports = function () {

  var _currentIdx = 0
  var id
  var tracks = []
  var totalDuration

  var next = function () {
    _currentIdx += 1
    return tracks[_currentIdx]
  }

  var currentTrack = function () {
    return tracks[_currentIdx]
  }

  var rewind = function () {
    _currentIdx = 0
    return currentTrack()
  }

  var totalProgress = function (currentProgress) {

    var previous = 0

    for (var i = _currentIdx - 1; i >= 0; i = i - 1) {
      previous += tracks[i].duration
    }

    return (currentTrack().duration * currentProgress + previous) / totalDuration

  }

  var search = function (progress) {

    var start = 0
    var idx = -1
    var position = 0

    progress = progress * totalDuration

    _pluck(tracks, 'duration').some(function (duration, i) {
      if (start + duration > progress) {
        idx = i
        position = progress - start
        return true
      }

      start += duration
    })

    return {
      track: tracks[idx],
      position: position
    }

  }

  var composition = function () {
    var start = 0
    return _pluck(tracks, 'duration').map(function (duration) {
      var retval = start / totalDuration
      start += duration
      return retval
    })
  }

}
