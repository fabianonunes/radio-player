'use strict'

module.exports = function (data) {
  var _currentIdx = data.currentTrack || 0
  var totalDuration = data.tracks.reduce(function (accum, track) {
    return accum + track.duration
  }, 0)

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

  var release = function () {
    _currentIdx = -1
    return currentTrack()
  }

  var currentProgress = function (progress) {
    var previous = 0

    for (var i = _currentIdx - 1; i >= 0; i = i - 1) {
      previous += tracks[i].duration
    }

    return (currentTrack().duration * progress + previous) / totalDuration
  }

  var currentTime = function (progress) {
    return currentProgress(progress) * totalDuration
  }

  var totalTime = function () {
    return totalDuration
  }

  var _search = function (at) {
    var start = 0
    var idx = -1
    var position = 0

    tracks
    .map(function (t) { return t.duration })
    .some(function (duration, i) {
      if (start + duration >= at) {
        idx = i
        position = at - start
        return true
      }
      start += duration
    })

    return {
      idx: idx,
      track: tracks[idx],
      position: position
    }
  }

  var search = function (progress) {
    progress = Math.min(progress, 0.99)
    return _search(progress * totalDuration)
  }

  var composition = function () {
    var start = 0
    return tracks.map(function (t) { return t.duration }).map(function (duration) {
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
    release: release,
    setTrack: setTrack,
    currentTrack: currentTrack,
    currentProgress: currentProgress,
    currentTime: currentTime,
    totalTime: totalTime,
    size: function () {
      return tracks.length
    },
    tracks: function () {
      return tracks
    }
  }
}
