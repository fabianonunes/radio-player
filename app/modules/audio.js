'use strict'

var Eev = require('eev')

module.exports = function ($audio) {

  var emitter = new Eev()

  var audioEmitter = $audio
  var audio = $audio.get(0)

  var state
  var disc

  var bindAudioEvents
  var cue

  var emitNewState = function (newState) {
    if (state !== newState) {
      emitter.emit(newState)
    }
  }

  var lastTime
  var loop = function () {
    if (lastTime !== undefined) {
      emitNewState(audio.currentTime === lastTime ? 'waiting' : 'playing')
    }

    lastTime = audio.currentTime
  }

  var intervalId
  var watch = function (stop) {
    clearInterval(intervalId)
    lastTime = undefined
    if (!stop) {
      loop()
      intervalId = setInterval(loop, 200)
    }
  }

  var play = function () {
    if (disc) {
      if (disc.currentTrack()) {
        audio.play()
        watch()
      } else {
        disc.rewind()
        cue()
      }
    }
  }

  var pause = function (quiet) {
    if (disc) {
      watch(true)
      audio.pause()
      if (quiet !== true) {
        audioEmitter.one('pause', function () {
          emitter.emit('pause')
        })
      }
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
    disc = null
  }

  var error = function () {
    eject()
    emitter.emit('error', disc)
  }

  var timeupdate = function () {
    emitter.emit('progress', {
      progress: disc.currentProgress(audio.currentTime / audio.duration),
      currentTime: audio.currentTime
    })
  }

  var seek = function (position) {
    pause(true)
    audio.currentTime = position
    setTimeout(function () {
      if (audio.paused) {
        emitNewState('waiting')
      }
    }, 20)

    audioEmitter.one('seeked', function () {
      // se não houver dados suficientes, o player do safari fica rodando no vazio
      if (audio.readyState < 3) {
        audioEmitter.one('canplay', play)
      } else {
        play()
      }
    })
  }

  cue = function (position) {

    audioEmitter.off()

    emitter.emit('waiting')

    audioEmitter
    .one('error', error)
    .one('loadedmetadata', play)
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

    audio.src = disc.currentTrack().url
    audio.load() // necessário para o IOS
    emitter.emit('cued', disc.currentTrack())
  }

  var search = function (progress) {
    if (disc) {
      pause(true)
      var search = disc.search(progress)
      if (disc.currentTrack().idx !== search.track.idx) {
        disc.setTrack(search.track.idx)
        cue(search.position)
      } else {
        seek(search.position)
      }
    }
  }

  var rewind = function () {
    watch(true)
    disc.release()
    emitter.emit('progress', {
      progress: 0,
      currentTime: 0
    })
    emitNewState('stop')
  }

  var ended = function () {
    var next = disc.next()
    if (next) {
      cue()
    } else {
      rewind()
    }
  }

  var load = function (d) {
    if (!d) {
      throw error()
    }

    eject()
    disc = d
    d.rewind()
  }

  var point = function (d) {
    load(d)
    cue()
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
  emitter.load = load
  emitter.point = point
  emitter.search = search
  emitter.disc = function () {
    return disc
  }

  ;['error', 'pause', 'playing', 'stop', 'waiting'].forEach(function (event) {
    emitter.on(event, function () {
      state = event
      emitter.emit('state', event)
    })
  })

  return emitter

}
