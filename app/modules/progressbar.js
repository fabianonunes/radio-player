'use strict'

var $ = require('jquery')
var Eev = require('eev')
var transformKey = require('./lib/transform-key')

module.exports = function (el) {

  var $el = $(el)
  var r = new Eev()

  var scrubber = $el.find('.Progress-scrubber')[0]
  var bar = $('<div class="Progress-bar"/>').prependTo($el)[0]
  var done = $('<div class="Progress-done"/>').prependTo(bar)[0]

  var value = 0
  var isDragging = false
  var componentWidth
  var elOffset

  var maxValue = function () {
    return $el.data('maxValue')
  }

  var change = function () {
    r.emit('change', { value: value * maxValue(), progress: value })
  }

  var updateDimensions = function () {
    // atualiza largura do component em caso de resize
    componentWidth = $el.outerWidth() // TODO : width ou outerWidth?
    elOffset = $el.offset()
  }

  var doneStyle = done.style
  var scrubberStyle = scrubber.style
  var updateWidth = function () {
    var property = 'translateX(' + (value - 1) * 100 + '%)'
    doneStyle[transformKey] = property

    if (scrubber) {
      scrubberStyle[transformKey] = property
    }

    if (isDragging) {
      requestAnimationFrame(updateWidth)
    }
  }

  var setValue = function (v, adjust) {
    value = Math.max(0, Math.min(v, 1))
    r.emit(adjust ? 'adjust' : 'change', value * maxValue(), value)
  }

  var inputPosition = function (ev) {
    var offsetX = ev.pageX - elOffset.left
    return offsetX / componentWidth
  }

  var click = function (ev) {
    updateDimensions()
    setValue(inputPosition(ev), true)
    requestAnimationFrame(updateWidth)
    change()
  }

  var touchmove = function (ev) {
    ev = ev.originalEvent || ev
    setValue(inputPosition(ev.changedTouches[0]), true)
  }

  var touchstart = function (ev) {
    updateDimensions()

    // TODO: adicionar classe que avisa o dragging
    if (!isDragging) {
      isDragging = true
      touchmove(ev)
      requestAnimationFrame(updateWidth)
    }

    ev.preventDefault()
  }

  var touchend = function () {
    // TODO: remover classe que avisa o dragging
    isDragging = false
    change()
  }

  $el
    .on('click.progress', click)
    .on('touchstart.progress', touchstart)
    .on('touchmove.progress', touchmove)
    .on('touchend.progress', touchend)

  // TODO: marcar pontos na progressbar
  // pipes: function (composition) {
  //   composition.shift()
  //   this.bar.find('.Progress-pipe').remove()
  //   composition.forEach(function (sect) {
  //     $('<span class="Progress-pipe"></span>')
  //       .css({ left: sect * 100 + '%' }).insertBefore(this.done)
  //   }.bind(this))
  // }

  updateWidth()

  r.setValue = setValue

  return r

}
