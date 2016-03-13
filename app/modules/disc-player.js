/* global Promise */
'use strict'

var $            = require('jquery')
var qwest        = require('qwest')
var progressbar  = require('./progressbar')
var audioPlayer  = require('./audio')
var discr        = require('./disc')

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
    var $download   = this.$el.find('.js-downloadprogress:first')

    _this.ap        = audioPlayer($audio)

    var bar         = progressbar($bar)
    var disc        = discr(this.$el.data('disc'))

    var opts        = { responseType: 'arraybuffer', cache: true }

    var download    = $download.length && progressbar($download)
    if (download) {
      download.enable(true)
    }

    var first = Promise.resolve(1)
    var trackdownloads = disc.tracks().map(function (track, i, array) {
      var q = 1 / array.length
      first = first.then(function () {
        return qwest.get(track.url, null, opts, function (xhr) {
          xhr.onprogress = function (e) {
            if (download) {
              var v = q * e.loaded / e.total
              download.setValue(v + q * i)
            }
          }
        }).then(function (results) {
          var arrayBufferView = new Uint8Array(results.response)
          var blob = new Blob([arrayBufferView], { type: 'audio/mpeg' })
          return {
            track: track,
            response: blob
          }
        })
      })

      return first
    })

    Promise.all(trackdownloads).then(function (results) {
      $download.hide()
      results.forEach(function (result) {
        result.track.url = URL.createObjectURL(result.response)
        $knob.prop('disabled', false)
      })
    })

    $knob.prop('disabled', true)

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
  },

  stop: function () {
    this.ap.pause()
  },

  download: function () {
    console.log()
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
