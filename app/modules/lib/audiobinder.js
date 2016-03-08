'use strict'
module.exports = function (emitter) {
  ;['abort', 'canplay', 'canplaythrough', 'durationchange',
  'emptied', 'encrypted ', 'ended', 'error',
  'interruptbegin', 'interruptend', 'loadeddata',
  'loadedmetadata', 'loadstart', 'mozaudioavailable',
  'pause', 'play', 'playing', 'progress', 'ratechange', 'seeked', 'seeking', 'stalled', 'suspend',
  'timeupdate', 'volumechange', 'waiting'].forEach(function (eventName) {
    emitter.on(eventName, function () {
      console.log(eventName)
    })
  })
}
