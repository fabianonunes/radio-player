'use strict'

var $ = require('jquery')
var $body = $(document.body)

var RadioPlayer = Backbone.View.extend({

  currentTrack: null,

  events: {
    'click [data-state="is-paused"] .js-knob': 'play',
    'click [data-state="is-playing"] .js-knob': 'pause',
  },

  isDragging: false,

  initialize: function () {

    this.$audio = this.$('audio')
    this.audio = this.$audio[0]

    this.done = this.$('.js-done')
    this.bar = this.done.offsetParent()

    this.controls = this.$('.js-switchboard')
    this.time = this.$('.js-time')
    this.title = this.$('.js-title')

    this.play = this.play.bind(this)

  },

  bindAudioEvents: function () {

    var _this = this

    ;['timeupdate', 'ended', 'waiting'].forEach(function (event) {
      _this.$audio.on(event, _this['on' + event].bind(_this))
    })

    _this.$audio.on('loadstart', this.onwaiting.bind(this))

  },

  play: function (quiet) {
    if (this.currentTrack) {
      this.lastUpdate = 10e90
      this.lastTime = 10e90
      if (quiet !== true) {
        this.onplaying()
      }

      this.audio.play()
      this.paused = false
    }
  },

  pause: function () {
    if (this.currentTrack) {
      this.$audio.one('pause', this.onpause.bind(this))
      this.audio.pause()
      this.paused = true
    }
  },

  seek: function (evt) {
    if (this.currentTrack) {
      var offsetX = evt.pageX - this.bar.offset().left
      var width = this.bar.outerWidth()
      var progress = offsetX / width
      this._search(offsetX / width)
      this._barwidth(progress)
    }
  },

  _search: function (progress) {
    this.audio.pause()
    var search = this.currentTrack.search(progress)
    if (this.currentTrack.get('current') !== search.idx) {
      this.currentTrack.set('current', search.idx)
      this.cue(this.currentTrack.currentAudio(), search.position)
    } else {
      this._seek(search.position)
    }
  },

  _seek: function (position) {
    this.onwaiting()
    this.$audio.off()
    this.audio.pause()
    this.audio.currentTime = position
    this.$audio.one('seeked', function () {
      // se não houver dados suficientes, o player do safari fica rodando no vazio igual um mané
      if (this.audio.readyState < 3) {
        this.$audio.one('canplay', this.resume.bind(this))
      } else {
        this.resume()
      }
    }.bind(this))
  },

  resume: function () {
    this.audio.play()
    this.bindAudioEvents()
  },

  ontimeupdate: function () {

    var currentUpdate = new Date().getTime()
    var currentTime = this.audio.currentTime * 1000
    var diffUpdate = currentUpdate - this.lastUpdate
    var diffTime = currentTime - this.lastTime
    var comparison = Math.round(diffUpdate / diffTime)

    //if (comparison !== 1 && Math.round(diffTime/250) !== 1) {
    if (diffTime < 0 || comparison !== 1) {
      this.onwaiting()
    } else if (!this.audio.paused && this.state !== 'playing') {
      this.onplaying()
    }

    this.lastUpdate = currentUpdate
    this.lastTime = currentTime

    var progress = this.audio.currentTime / this.audio.duration
    var totalProgress = this.currentTrack.totalProgress(progress)

    var time = this._secondsToTime(this.audio.currentTime)
    if (this.time.text() !== time) {
      this.time.text(time)
    }

    if (!this.isDragging) {
      this._barwidth(totalProgress)
    }

    this.currentTrack.trigger('timeupdate', totalProgress)

  },

  onended: function () {
    var next = this.currentTrack.next()
    if (next) {
      this.cue(next)
    } else {
      //this.eject()
      this.rewind()
    }
  },

  onplaying: function () {
    var state = 'playing'
    this.controls.attr('data-state', 'is-' + state)
    this.currentTrack.set('state', state)
  },

  onpause: function () {
    var state = 'paused'
    this.controls.attr('data-state', 'is-' + state)
    this.currentTrack.set('state', state)
  },

  onwaiting: function () {
    var state = 'waiting'
    this.controls.attr('data-state', 'is-' + state)
    this.currentTrack.set('state', state)
  },

  _secondsToTime: function (time) {
    var h = time / 3600
    var m = h % 1 * 60
    var s = m % 1 * 60
    var f = Math.floor
    s = ('0' + f(s)).slice(-2)
    m = h ? ('0' + f(m)).slice(-2) : f(m)
    h = f(h)
    var r = [h, m, s]
    if (!h) {
      r.shift()
    }

    return r.join(':')
  },

  point: function (track) {
    this.show()
    if (!this.currentTrack || this.currentTrack.id !== track.id) {
      this.eject()
      this.currentTrack = track
      this._barwidth(0)
      this.pipes(track.composition())
      this.cue(this.currentTrack.currentAudio())
      this.trigger('pointed', track)
    }
  },

  pipes: function (composition) {
    composition.shift()
    this.bar.find('.Progress-pipe').remove()
    composition.forEach(function (sect) {
      $('<span class="Progress-pipe"></span>')
        .css({ left: sect * 100 + '%' }).insertBefore(this.done)
    }.bind(this))
  },

  cue: function (audio, position) {

    this.stop()
    this.onwaiting()

    if (!audio) {
      return this.error()
    }

    if (this.currentTrack.get('title') === audio.title) {
      this.title.html(this.currentTrack.get('title'))
    } else {
      this.title.html(this.currentTrack.get('title') + '<br/>' + audio.title)
    }

    this.$audio.one('error', this.error.bind(this))
    this.audio.src = portalUrl.replace(/^https:/, 'http:') + '/@@audio/' + audio.arquivo
    this.audio.load() // necessário para o IOS
    //this.play(true)
    this.$audio.one('loadedmetadata', this.play.bind(this, true))
    this.trigger('cued', true)

    this.$audio.one('loadeddata', function () {
      if (position) {
        // android player só recupera a duração depois do primeiro timeupdate
        if (this.audio.duration === 100 && this.audio.currentTime === 0) {
          this.$audio.one('timeupdate', function () {
            this._seek(position)
            this.ontimeupdate()
          }.bind(this))
        } else {
          this._seek(position)
        }
      } else {
        this.bindAudioEvents()
      }
    }.bind(this))

  },

  eject: function () {
    if (this.currentTrack) {
      this.stop()
      this.currentTrack.trigger('ejected')
      this.currentTrack = null
      this.controls.attr('data-state', 'is-paused')
      this._barwidth(0)
    }
  },

  rewind: function () {
    this.onpause()
    this.currentTrack.rewind()
    this._barwidth(0)
  },

  error: function () {
    var state = 'error'
    var track = this.currentTrack

    this.title.text('Não foi possível carregar o arquivo de áudio.')

    this.eject()
    track.set('state', state)
    this.trigger('error', track.id)
    this.controls.attr('data-state', 'is-' + state)
  },

  stop: function () {
    this.title.text('')
    this.time.text('')
    this.$audio.off()
    if (this.audio.readyState > 0 ) {
      this.pause()
      this.audio.currentTime = 0
    }

    this.audio.src = ''
  },

  _barwidth: function (progress) {
    if (this.isDragging) {
      requestAnimationFrame(this._barwidth.bind(this, this.dragPosition))
    }

    var barwidth = this.bar.width()
    var newWidth = Math.round(progress * barwidth)
    if (newWidth !== this.done.data('width')) {
      var value = 'translateX(' + progress * 100 + '%)'
      var style = this.done[0].style
      style.transform = style.webkitTransform = style.msTransform = value
      this.done.data('width', newWidth)
    }
  },

  touchstart: function (ev) {
    if (this.currentTrack) {
      if (!this.isDragging) {
        this.isDragging = true
        this.touchmove(ev) // guardar dragPosition
        this._barwidth(this.dragPosition)
        this.done.addClass('is-dragging')
      }

      ev.preventDefault()
    }
  },

  touchmove: function (evt) {
    evt = evt.originalEvent || evt
    this.dragPosition = evt.changedTouches[0].pageX / window.innerWidth
  },

  touchend: function (evt) {
    if (this.currentTrack) {
      this.done.removeClass('is-dragging')
      var progress = evt.originalEvent.changedTouches[0].pageX / window.innerWidth
      this.isDragging = false
      this._search(progress)
    }
  },

  show: function () {
    this.$el.css({ bottom: '0' })
    $body.css({ 'padding-bottom': this.$el.outerHeight() })
  }

})

module.exports = new RadioPlayer({
  el: $('.js-player')[0]
})
