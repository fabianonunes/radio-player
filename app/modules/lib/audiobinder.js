'use strict'
module.exports = function (media, out) {
  ;['abort.audiobinder',
    'canplay.audiobinder',
    'canplaythrough.audiobinder',
    'durationchange.audiobinder',
    'emptied.audiobinder',
    'encrypted .audiobinder',
    'ended.audiobinder',
    'error.audiobinder',
    'interruptbegin.audiobinder',
    'interruptend.audiobinder',
    'loadeddata.audiobinder',
    'loadedmetadata.audiobinder',
    'loadstart.audiobinder',
    'mozaudioavailable.audiobinder',
    'pause.audiobinder',
    'play.audiobinder',
    'playing.audiobinder',
    // 'progress.audiobinder',
    'ratechange.audiobinder',
    'seeked.audiobinder',
    'seeking.audiobinder',
    'stalled.audiobinder',
    'suspend.audiobinder',
    'timeupdate.audiobinder',
    'volumechange.audiobinder',
    'waiting.audiobinder'
  ].forEach(function (eventName) {
    media.on(eventName, function () {
      var print = out !== undefined ? out : console.log.bind(console)
      print(
        eventName,
        media[0].currentTime, media[0].duration, media[0].readyState, media[0].buffered.length && media[0].buffered.end(0)
      )
    })
  })
}
