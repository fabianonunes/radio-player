'use strict'

var Eev = require('eev')

module.exports = function ($audio) {

  var emitter      = new Eev()
  var audioEmitter = $audio
  var audio        = $audio.get(0)

  var state
  var disc
  var on
  var cue

  var emitNewState = function (newState) {
    if (state !== newState) {
      emitter.emit(newState)
    }
  }

  var lastTime
  var intervalId
  var loop = function () {
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
        audioEmitter.one('pause', function () {
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

  var download = function () {
    stop()
    audio.src = disc.currentTrack().url
    audio.load() // necessário para o IOS
    on()
  }

  cue = function (position) {
    download()
    audioEmitter.one('loadedmetadata', play)

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

    emitter.emit('waiting')
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

  ;['error', 'pause', 'playing', 'stop', 'waiting'].forEach(function (event) {
    emitter.on(event, function () {
      state = event
      emitter.emit('state', event)
    })
  })

  return emitter

}
