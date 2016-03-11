'use strict'

var $            = require('jquery')
var progressbar  = require('./progressbar')
var audioPlayer  = require('./audio')
var discr        = require('./disc')
var _throttle    = require('lodash/throttle')

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

    bar.disable()
    bar.on('change', function (data) {
      _this.ap.search(data.progress)
    })

    this.ap.on('progress', _throttle(function (data) {
      console.log(data)
      bar.slide(data.progress)
    }, 1000))

    this.ap.on('state', function (state) {
      if (state === 'playing') {
        $('.Player').not(_this.$el).discPlayer('stop')
      }
    })

    this.ap.on('cued', function () {
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
