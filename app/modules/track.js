'use strict'

var _map = require('lodash/map')

module.exports = function (data) {

  var _currentIdx = 0
  var totalDuration = data.duration

  var tracks = data.tracks.map(function (track, i) {
    track.idx = i
    return track
  })

  var next = function () {
    _currentIdx += 1
    return tracks[_currentIdx]
  }

  var currentTrack = function () {
    return tracks[_currentIdx]
  }

  var setTrack = function (idx) {
    _currentIdx = idx
  }

  var rewind = function () {
    _currentIdx = 0
    return currentTrack()
  }

  var currentProgress = function (progress) {

    var previous = 0

    for (var i = _currentIdx - 1; i >= 0; i = i - 1) {
      previous += tracks[i].duration
    }

    return (currentTrack().duration * progress + previous) / totalDuration

  }

  var search = function (progress) {

    var start = 0
    var idx = -1
    var position = 0

    progress = progress * totalDuration

    _map(tracks, 'duration').some(function (duration, i) {
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
    return _map(tracks, 'duration').map(function (duration) {
      var retval = start / totalDuration
      start += duration
      return retval
    }).slice(1)
  }

  return {
    next: next,
    composition: composition,
    search: search,
    rewind: rewind,
    setTrack: setTrack,
    currentTrack: currentTrack,
    currentProgress: currentProgress
  }

}
