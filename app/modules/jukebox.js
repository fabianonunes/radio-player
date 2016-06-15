var EventEmitter = require('wolfy87-eventemitter')

module.exports = function ($media) {
  var emitter = new EventEmitter()
  var media = $media.get(0)

  var elementDisplay = $media.css('display')

  var currentState
  var disc
  var on
  var cue

  var emitStateChange = function (state, delay) {
    if (currentState !== state) {
      var f = emitter.emit.bind(emitter, state)
      return delay ? setTimeout(f, delay) : f()
    }
  }

  var lastTime
  var intervalId
  var loop = function () {
    if ($media.closest(document.documentElement).length === 0) {
      // verificar se o elemento foi removido do DOM
      return stopWatch()
    }

    if (lastTime !== undefined) {
      emitStateChange(media.currentTime === lastTime ? 'waiting' : 'playing')
    }

    lastTime = media.currentTime
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
    $media.off('.jukebox')
  }

  var play = function () {
    if (disc.currentTrack()) {
      media.play()
      watch()
      emitStateChange('playing')
    } else {
      disc.rewind()
      cue()
    }
  }

  var pause = function (quiet) {
    stopWatch()
    media.pause()
    if (quiet !== true) {
      $media.one('pause.jukebox', function () {
        emitStateChange('pause')
      })
    }
  }

  var stop = function () {
    off()
    if (media.readyState > 0) {
      pause()
      media.currentTime = 0
    }

    media.src = ''
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
    var progress = (media.currentTime / media.duration) || 0
    emitter.emit('progress', {
      progress: disc.currentProgress(progress),
      currentTime: disc.currentTime(progress),
      totalTime: disc.totalTime()
    })
  }

  var seek = function (position) {
    pause(true)
    media.currentTime = position
    var waitingId = emitStateChange('waiting', 50)

    $media.one('seeked.jukebox', function () {
      $media.css({ 'display': elementDisplay })
      clearTimeout(waitingId)

      // se não houver dados suficientes, o player do safari fica rodando no vazio
      if (media.readyState < 3) {
        $media.one('canplay.jukebox', play)
      } else {
        play()
      }
    })
  }

  var noop = function () {}

  cue = function (position, quiet) {
    off()

    var waitingId = emitStateChange('waiting', 50)

    $media
    .one('error.jukebox', error)
    .one('canplay.jukebox', quiet === true ? noop : play)
    .one('loadeddata.jukebox', function () {
      clearTimeout(waitingId)
      if (position) {
        // android player só recupera a duração depois do primeiro timeupdate
        if (media.duration === 100 && media.currentTime === 0) {
          $media.one('timeupdate.jukebox', function () {
            seek(position)
          })
        } else {
          seek(position)
        }
      }

      on()
    })

    media.src = disc.currentTrack().url
    media.load() // necessário para o IOS
    emitter.emit('cued', disc.currentTrack())
    timeupdate()
  }

  var search = function (progress) {
    pause(/* quiet */ true)
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
    emitStateChange('stop')
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
  }

  var point = function (d, quiet) {
    load(d)
    cue(0, quiet)
  }

  var toggle = function () {
    if (currentState !== 'playing') {
      play()
    } else {
      pause()
    }
  }

  var tune = function (idx) {
    disc.setTrack(idx)
    cue()
  }

  on = function () {
    $media
      .on('timeupdate.jukebox', timeupdate)
      .on('ended.jukebox', ended)
      .on('waiting.jukebox loadstart.jukebox', function () {
        emitter.emit('waiting')
      })
  }

  emitter.play = play
  emitter.pause = pause
  emitter.load = load
  emitter.point = point
  emitter.search = search
  emitter.toggle = toggle
  emitter.tune = tune
  emitter.disc = function () { return disc }
  emitter.state = function () { return currentState }

  ;['error', 'pause', 'playing', 'stop', 'waiting'].forEach(function (event) {
    emitter.on(event, function () {
      currentState = event
      emitter.emit('state', event)
    })
  })

  return emitter
}
