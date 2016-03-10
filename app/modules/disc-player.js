'use strict'

var $            = require('jquery')
var progressbar  = require('./progressbar')
var audioPlayer  = require('./audio')
var discr        = require('./disc')

var pluginName   = 'discPlayer'
var defaults     = {}

var discPlayer = {

  init: function (element, options) {
    this.$el = $(element)
    this.options = $.extend({}, defaults, options)
    this._defaults = defaults
    this._name = pluginName
    this._build()
    return this
  },

  _build: function () {

    var $knob  = this.$el.find('.Player-knob:first')
    var $audio = this.$el.find('audio:first')
    var $bar   = this.$el.find('.Progress:first')

    var ap     = audioPlayer($audio)
    var bar    = progressbar($bar)
    var disc   = discr(this.$el.data('disc'))

    bar.disable()
    bar.on('change', function (data) {
      ap.search(data.progress)
    })

    ap.on('progress', function (data) {
      bar.slide(data.progress)
    })

    ap.on('cued', function () {
      bar.enable()
      bar.pipes(ap.disc().composition())
    })

    ap.on('stop', bar.disable)

    ap.on('state', function (state) {
      $knob.attr('data-state', state)
    })

    $knob.on('click', function () {
      if (!ap.disc()) {
        ap.point(disc)
      } else {
        ap.toggle()
      }
    })

  }
}

$.fn[pluginName] = function (optionsOrMethod) {
  return this.each(function () {
    var plugin = $.data(this, 'plugin-' + pluginName)
    if (!plugin) {
      plugin = Object.create(discPlayer.init(this, optionsOrMethod))
      $.data(this, 'plugin-' + pluginName, plugin)
    } else if (plugin[optionsOrMethod]) {
      plugin[optionsOrMethod]()
    }
  })
}
