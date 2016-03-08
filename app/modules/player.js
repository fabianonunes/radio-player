'use strict'

var Eev = require('eev')

module.exports = function (audio, emitterAdapter) {

  var audioEmitter = emitterAdapter(audio)
  var emitter = new Eev()

  var trackSet
  var lastUpdate
  var lastTime
  var bindAudioEvents

  var play = function (quiet) {
    lastUpdate = lastTime = false

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

  var timerId
  var timeupdate = function () {

    var currentUpdate = new Date().getTime()
    var currentTime = audio.currentTime * 1000
    var diffUpdate = currentUpdate - (lastUpdate || currentUpdate)
    var diffTime = currentTime - (lastTime || currentTime)
    var comparison = Math.round(diffUpdate / diffTime)

    clearTimeout(timerId)

    timerId = setTimeout(function () {
      if (!audio.paused) {
        if (diffTime < 0 || comparison !== 1) {
          emitter.emit('waiting')
        } else {
          emitter.emit('playing')
        }
      }
    }, 250)

    lastUpdate = currentUpdate
    lastTime = currentTime

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

    emitter.emit('cued')

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
    if (!trackSet || trackSet.id !== ts.id) {
      eject()
      trackSet = ts
      cue(trackSet.rewind())
    }
  }

  bindAudioEvents = function () {
    audioEmitter
      .on('timeupdate', timeupdate)
      .on('ended', ended)
      .on('waiting loadstart', function () {
        emitter.emit('waiting')
      })

    ;['abort', 'canplay', 'canplaythrough', 'durationchange',
    'emptied', 'encrypted ', 'ended', 'error',
    'interruptbegin', 'interruptend', 'loadeddata',
    'loadedmetadata', 'loadstart', 'mozaudioavailable',
    'pause', 'play', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend',
    'timeupdate', 'volumechange', 'waiting'].forEach(function (eventName) {
      audioEmitter.on(eventName, function () {
        console.log(eventName)
      })
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
