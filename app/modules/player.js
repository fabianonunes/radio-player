'use strict'

module.exports = function (audio, emitterAdapter) {

  var audioEmitter = emitterAdapter(audio)
  var emitter = {}

  var trackSet
  var lastUpdate
  var lastTime
  var bindAudioEvents

  var play = function (quiet) {
    lastUpdate = lastTime = 10e90
    audio.play()

    if (quiet !== true) {
      emitter.fire('playing')
    }
  }

  var pause = function (quiet) {
    audio.pause()

    if (quiet !== true) {
      audioEmitter.one('pause', function () {
        emitter.fire('pause')
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
    emitter.fire('stop')
  }

  var eject = function () {
    stop()
    trackSet = null
  }

  var error = function () {
    eject()
    emitter.fire('error', trackSet)
  }

  var timeupdate = function () {
    var currentUpdate = new Date().getTime()
    var currentTime = audio.currentTime * 1000
    var diffUpdate = currentUpdate - lastUpdate
    var diffTime = currentTime - lastTime
    var comparison = Math.round(diffUpdate / diffTime)

    if (diffTime < 0 || comparison !== 1) {
      emitter.fire('waiting')
    } else if (!audio.paused) {
      emitter.fire('playing')
    }

    lastUpdate = currentUpdate
    lastTime = currentTime

    var progress = audio.currentTime / audio.duration
    emitter.fire('progress', trackSet.currentProgress(progress))
  }

  var seek = function (position) {
    emitter.fire('waiting')
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
    stop()

    if (!track) {
      return error()
    }

    emitter.fire('waiting')

    audioEmitter.one('error', error)
    audio.src = trackSet.currentTrack.url
    audio.load() // necessário para o IOS

    audioEmitter
    .one('loadedmetadata', play.bind(null, true))
    .one('loadeddata', function () {
      if (position) {
        // android player só recupera a duração depois do primeiro timeupdate
        if (audio.duration === 100 && audio.currentTime === 0) {
          audioEmitter.one('timeupdate', function () {
            seek(position)
            /* timeupdate() // necessário? */
          })
        } else {
          seek(position)
        }
      } else {
        bindAudioEvents()
      }
    })

  }

  var search = function (progress) {
    pause(true)
    var search = trackSet.search(progress)
    if (trackSet.currentTrack.idx !== search.track.idx) {
      trackSet.currentTrack = search.track
      cue(trackSet.currentTrack, search.position)
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
      /* set pipes pipes(track.composition()) */
    }
  }

  bindAudioEvents = function () {
    audioEmitter
      .on('timeupdate', timeupdate)
      .on('ended', ended)
      .on('waiting loadstart', emitter.fire.bind(emitter, 'waiting'))
  }

  return {
    play: play,
    pause: pause,
    point: point,
    search: search,
    ejected: eject
  }

}
