'use strict'

var $            = require('jquery')
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

    var _this  = this

    var $knob  = this.$el.find('.Player-knob:first')
    var $audio = this.$el.find('audio:first')
    var $bar   = this.$el.find('.Progress:first')

    _this.ap   = audioPlayer($audio)

    var bar    = progressbar($bar)
    var disc   = discr(this.$el.data('disc'))

    disc.tracks().forEach(function (track) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', track.url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function () {
        var arrayBufferView = new Uint8Array(this.response)
        var blob = new Blob([arrayBufferView], { type: 'image/jpeg' })
        var urlCreator = window.URL || window.webkitURL
        track.url = urlCreator.createObjectURL(blob)
        console.log(track)
      }

      xhr.send()
    })

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
