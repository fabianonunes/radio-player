'use strict'

var Eev = require('eev')
var helpers = require('./lib/helpers')

module.exports = function ($audio) {
  var emitter = new Eev()
  var audioEmitter = $audio
  var audio = $audio.get(0)

  var state
  var disc
  var on
  var cue

  var emitNewState = function (newState, delay) {
    if (state !== newState) {
      var f = emitter.emit.bind(emitter, newState)
      return delay ? setTimeout(f, delay) : f()
    }
  }

  var lastTime
  var intervalId
  var loop = function () {
    if ($audio.closest(document.documentElement).length === 0) {
      return stopWatch()
    }

    if (lastTime !== undefined) {
      emitNewState(audio.currentTime === lastTime ? 'waiting' : 'playing')
    }

    lastTime = audio.currentTime
  }

  var stopWatch = function () {
    clearInterval(intervalId)
    lastTime = undefined
  }

  var watch = function () {
    stopWatch(intervalId)
    loop()
    intervalId = setInterval(loop, 200)
  }

  var off = function () {
    audioEmitter.off('.audio')
  }

  var play = function () {
    if (disc.currentTrack()) {
      audio.play()
      watch()
      emitNewState('playing')
    } else {
      disc.rewind()
      cue()
    }
  }

  var pause = function (quiet) {
    if (disc) {
      stopWatch()
      audio.pause()
      if (quiet !== true) {
        audioEmitter.one('pause.audio', function () {
          emitNewState('pause')
        })
      }
    }
  }

  var stop = function () {
    off()
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
    var progress = audio.currentTime / audio.duration
    emitter.emit('progress', {
      progress: disc.currentProgress(progress),
      currentTime: helpers.secondsToTime(disc.currentTime(progress)),
      totalTime: helpers.secondsToTime(disc.totalTime())
    })
  }

  var seek = function (position) {
    pause(true)
    audio.currentTime = position
    var waitingId = emitNewState('waiting', 50)

    audioEmitter.one('seeked.audio', function () {
      clearTimeout(waitingId)

      // se não houver dados suficientes, o player do safari fica rodando no vazio
      if (audio.readyState < 3) {
        audioEmitter.one('canplay.audio', play)
      } else {
        play()
      }
    })
  }

  cue = function (position) {
    off()

    var waitingId = emitNewState('waiting', 50)

    audioEmitter
    .one('error.audio', error)
    .one('canplay.audio', play)
    .one('loadeddata.audio', function () {
      clearTimeout(waitingId)
      if (position) {
        // android player só recupera a duração depois do primeiro timeupdate
        if (audio.duration === 100 && audio.currentTime === 0) {
          audioEmitter.one('timeupdate.audio', function () {
            seek(position)
          })
        } else {
          seek(position)
        }
      }

      on()
    })

    audio.src = disc.currentTrack().url
    audio.load() // necessário para o IOS
    emitter.emit('cued', disc.currentTrack())
  }

  var search = function (progress) {
    pause(true)
    var r = disc.search(progress)
    if (disc.currentTrack().idx !== r.track.idx) {
      disc.setTrack(r.track.idx)
      cue(r.position)
    } else {
      seek(r.position)
    }
  }

  var rewind = function () {
    stopWatch()
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
      emitter.emit('ended')
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

  var toggle = function () {
    if (state !== 'playing') {
      play()
    } else {
      pause()
    }
  }

  on = function () {
    audioEmitter
      .on('timeupdate.audio', timeupdate)
      .on('ended.audio', ended)
      .on('waiting.audio loadstart.audio', function () {
        emitter.emit('waiting')
      })
  }

  emitter.play = play
  emitter.pause = pause
  emitter.load = load
  emitter.point = point
  emitter.search = search
  emitter.toggle = toggle
  emitter.disc = function () {
    return disc
  }
  emitter.state = function () {
    return state
  }

  ;['error', 'pause', 'playing', 'stop', 'waiting'].forEach(function (event) {
    emitter.on(event, function () {
      state = event
      emitter.emit('state', event)
    })
  })

  return emitter
}
