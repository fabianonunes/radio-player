'use strict'

var Eev = require('eev')

module.exports = function (audio, emitterAdapter) {

  var audioEmitter = emitterAdapter(audio)
  var emitter = new Eev()

  var trackSet
  var bindAudioEvents

  var play = function (quiet) {
    audio.play()
    if (quiet !== true) {
      emitter.emit('playing')
    }
  }

  var pause = function (quiet) {
    audio.pause()
    if (quiet !== true) {
      audioEmitter.one('pause', function () {
        emitter.emit('pause')
      })
    }
  }

  var stop = function () {
    audioEmitter.off()
    if (audio.readyState > 0) {
      pause()
      audio.currentTime = 0
    }

    audio.src = ''
    emitter.emit('stop')
  }

  var eject = function () {
    stop()
    trackSet = null
  }

  var error = function () {
    eject()
    emitter.emit('error', trackSet)
  }

  var timeupdate = function () {
    if (audio.paused) {
      emitter.emit('waiting')
    } else {
      emitter.emit('playing')
    }
    var progress = audio.currentTime / audio.duration
    emitter.emit('progress', {
      progress: trackSet.currentProgress(progress),
      currentTime: audio.currentTime
    })
  }

  var seek = function (position) {
    emitter.emit('waiting')
    pause(true)
    audio.currentTime = position

    audioEmitter.one('seeked', function () {
      // se não houver dados suficientes, o player do safari fica rodando no vazio
      if (audio.readyState < 3) {
        audioEmitter.one('canplay', play)
      } else {
        play()
      }
    })
  }

  var cue = function (track, position) {

    audioEmitter.off()

    if (!track) {
      return error()
    }

    emitter.emit('waiting')

    audioEmitter.one('error', error)
    audio.src = trackSet.currentTrack().url
    audio.load() // necessário para o IOS

    emitter.emit('cued', trackSet.currentTrack())

    audioEmitter
    .one('loadedmetadata', play.bind(null, true))
    .one('loadeddata', function () {
      if (position) {
        // android player só recupera a duração depois do primeiro timeupdate
        if (audio.duration === 100 && audio.currentTime === 0) {
          audioEmitter.one('timeupdate', function () {
            seek(position)
          })
        } else {
          seek(position)
        }
      }

      bindAudioEvents()
    })

  }

  var search = function (progress) {
    pause(true)
    var search = trackSet.search(progress)
    if (!search.track) {
      stop()
    } else if (trackSet.currentTrack().idx !== search.track.idx) {
      trackSet.setTrack(search.track.idx)
      cue(trackSet.currentTrack(), search.position)
    } else {
      seek(search.position)
    }
  }

  var ended = function () {
    var next = trackSet.next()
    if (next) {
      cue(next)
    } else {
      trackSet.rewind()
    }
  }

  var point = function (ts) {
    eject()
    trackSet = ts
    cue(trackSet.rewind())
  }

  bindAudioEvents = function () {
    audioEmitter
    .on('timeupdate', timeupdate)
    .on('ended', ended)
    .on('waiting loadstart', function () {
      emitter.emit('waiting')
    })
  }

  emitter.play = play
  emitter.pause = pause
  emitter.point = point
  emitter.search = search

  ;['error', 'pause', 'playing', 'stop', 'waiting'].forEach(function (event) {
    emitter.on(event, function () {
      emitter.emit('state', event)
    })
  })


  return emitter

}
