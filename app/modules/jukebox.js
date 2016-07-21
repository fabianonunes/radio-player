var EventEmitter = require('wolfy87-eventemitter')

module.exports = function ($media) {
  var emitter = new EventEmitter()
  var media = $media.get(0)

  var elementDisplay = $media.css('display')

  var currentState
  var disc
  var on
  var cue

  var stateDelay
  var emitStateChange = function (state, delay) {
    if (currentState !== state) {
      clearTimeout(stateDelay)
      currentState = state
      var f = emitter.emit.bind(emitter, state)
      stateDelay = delay ? setTimeout(f, delay) : f()
      return stateDelay
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
      $media.one('playing.jukebox', function () {
        emitStateChange('playing')
      })
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
    emitter.emit('error', disc)
  }

  var currentProgress = function () {
    var progress = (media.currentTime / media.duration) || 0
    return {
      progress: disc.currentProgress(progress),
      currentTime: disc.currentTime(progress),
      totalTime: disc.totalTime()
    }
  }

  var timeupdate = function () {
    emitter.emit('progress', currentProgress())
  }

  var seek = function (position, quiet) {
    media.play()
    media.currentTime = position
    media.pause() // sem o pause, o chrome do android não dispara eventos depois do seeked

    $media.one('seeked.jukebox', function () {
      $media.css({ 'display': elementDisplay })
      if (media.readyState < 3) {
        $media.one('canplaythrough.jukebox', play)
      } else {
        play() // depois do pause anterior, força o lançamento do evento playing
      }
    })
  }

  cue = function (position, quiet) {
    off()

    if (quiet !== true) {
      emitStateChange('waiting', 200)
    }

    $media
    .one('error.jukebox', error)
    .one('canplaythrough.jukebox', function () {
      if (quiet !== true && !position) { play() }
    })
    .one('playing.jukebox', function () {
      on()
    })
    .one('loadeddata.jukebox', function () {
      if (position) {
        // android player só recupera a duração depois do primeiro timeupdate
        // TODO: tentar reproduzir essa situação
        if (media.duration === 100 && media.currentTime === 0) {
          $media.one('timeupdate.jukebox', function () {
            seek(position)
          })
        } else {
          seek(position)
        }
      }
    })

    lastTime = undefined

    // evitar exibição do primeiro frame ao seek
    $media.css({ display: position ? 'none' : elementDisplay })

    media.src = disc.currentTrack().url
    media.load() // necessário para o IOS

    emitter.emit('cued', disc.currentTrack())
  }

  var search = function (progress, forcePlay) {
    var quiet = media.paused && !forcePlay
    pause(/* quiet */ true)
    var currentTrack = disc.currentTrack()
    var r = disc.search(progress)
    if (currentTrack && currentTrack.idx === r.track.idx) {
      seek(r.position, quiet)
    } else {
      disc.setTrack(r.track.idx)
      cue(r.position, quiet)
    }
  }

  var rewind = function () {
    stopWatch()
    disc.release()
    emitter.emit('progress', {
      progress: 0,
      currentTime: 0,
      totalTime: disc.totalTime()
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
    if (!d || d.size() === 0) {
      return
    }
    load(d)
    cue(0, quiet)
    timeupdate()
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
    timeupdate()
  }

  on = function () {
    $media
      .on('timeupdate.jukebox', timeupdate)
      .on('ended.jukebox', ended)
      .on('waiting.jukebox seeking.jukebox', function () {
        emitStateChange('waiting', 100)
      })
  }

  emitter.play = play
  emitter.pause = pause
  emitter.load = load
  emitter.point = point
  emitter.search = search
  emitter.toggle = toggle
  emitter.tune = tune
  emitter.currentProgress = currentProgress
  emitter.disc = function () { return disc }
  emitter.state = function () { return currentState }

  ;['error', 'pause', 'playing', 'stop', 'waiting'].forEach(function (event) {
    emitter.on(event, function () {
      emitter.emit('state', event)
    })
  })

  return emitter
}
