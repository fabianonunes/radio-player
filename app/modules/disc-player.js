'use strict'

var $            = require('jquery')
var pinkyswear   = require('pinkyswear')

var downloader   = require('./lib/track-download')
var progressbar  = require('./progressbar')
var audioPlayer  = require('./audio')
var discr        = require('./disc')
var hasBlob      = require('./lib/has-blob')

var pluginName   = 'discPlayer'
var defaults     = {}

var discPlayer = {

  init: function (element, options) {
    this.$el       = $(element)
    this.options   = $.extend({}, defaults, options)
    this._defaults = defaults
    this._name     = pluginName
    this._build()
    return this
  },

  _build: function () {

    var _this       = this

    var $knob       = this.$el.find('.Player-knob:first')
    var $audio      = this.$el.find('audio:first')
    var $bar        = this.$el.find('.js-audioprogress:first')

    var disc        = discr(this.$el.data('disc'))
    var bar         = progressbar($bar)

    _this.ap        = audioPlayer($audio)
    _this.$knob     = $knob
    _this.disc      = disc

    bar.disable()
    bar.on('change', function (data) {
      _this.ap.search(data.progress)
    })

    this.ap.on('progress', function (data) {
      bar.slide(data.progress)
    })

    this.ap.on('state', function (state) {
      if (state === 'playing') {
        $('.Player').not(_this.$el).discPlayer('stop')
      }
    })

    this.ap.on('cued', function () {
      bar.valueMax(_this.ap.disc().totalTime())
      bar.enable()
      bar.pipes(_this.ap.disc().composition())
    })

    this.ap.on('stop', bar.disable)
    this.ap.on('pause', bar.disable)

    this.ap.on('state', function (state) {
      $knob.attr('data-state', state)
    })

    $knob.on('click', function () {
      if (!_this.ap.disc()) {
        _this.ap.point(disc)
      } else {
        _this.ap.toggle()
      }
    })

    if (hasBlob) {
      this.download()
    }

  },

  stop: function () {
    this.ap.pause()
  },

  download: function () {

    var _this       = this
    var $download   = this.$el.find('.js-downloadprogress:first')
    var opts        = { responseType: 'blob', cache: true, timeout: 9e10 }

    this.$knob.prop('disabled', true)
    this.$knob.attr('data-state', 'downloading')

    var downloadbar    = $download.length && progressbar($download)
    if (downloadbar) {
      $download.removeClass('hidden')
      downloadbar.enable(true)
    }

    var first = pinkyswear()
    first(true)
    this.disc.tracks().forEach(function (track, i, array) {
      var q = 1 / array.length

      first = first.then(function () {
        return downloader(track.url, opts, function (e) {
          if (downloadbar) {
            var v = q * e.loaded / e.total
            downloadbar.setValue(v + q * i)
          }
        })
        .then(function (blob) {
          track.url = URL.createObjectURL(blob)
        })
      })

    })

    first.then(function () {
      $download.hide()
      _this.$knob.attr('data-state', 'paused')
      _this.$knob.prop('disabled', false)
    })

  }
}

$.fn[pluginName] = function (optionsOrMethod) {
  return this.each(function () {
    var plugin = $.data(this, 'plugin-' + pluginName)
    if (!plugin) {
      plugin = Object.create(discPlayer).init(this, optionsOrMethod)
      $.data(this, 'plugin-' + pluginName, plugin)
    } else if (plugin[optionsOrMethod]) {
      plugin[optionsOrMethod]()
    }
  })
}
