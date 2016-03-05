'use strict'

var Backbone = require('backbone')
var _pluck = require('lodash/pluck')

module.exports = Backbone.Model.extend({

  defaults: {
    current: 0,
    audios: [],
    state: 'paused'
  },

  next: function () {
    var idx = this.get('current') + 1
    this.set('current', idx)
    return this.get('audios')[idx]
  },

  rewind: function () {
    this.set('current', 0)
  },

  currentAudio: function () {
    return this.get('audios')[this.get('current')]
  },

  total: function () {
    return this.get('audios').length
  },

  totalProgress: function (currentProgress) {

    var previous = 0
    var current = this.get('audios')[this.get('current')]

    for (var i = this.get('current') - 1; i >= 0; i = i - 1) {
      previous += this.get('audios')[i].duracao
    }

    return (current.duracao * currentProgress + previous) / this.get('length')

  },

  search: function (progress) {

    var start = 0
    var idx = -1
    var position = 0
    var audios = this.get('audios')

    progress = progress * this.get('length')

    _pluck(audios, 'duracao').some(function (duration, i) {
      if (start + duration > progress) {
        idx = i
        position = progress - start
        return true
      }

      start += duration
    })

    return {
      idx: idx,
      position: position
    }

  },

  composition: function () {

    var start = 0
    var audios = this.get('audios')
    var length = this.get('length')

    return _pluck(audios, 'duracao').map(function (duration) {
      var retval = start / length
      start += duration
      return retval
    })

  }

})
