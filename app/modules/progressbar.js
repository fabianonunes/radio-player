'use strict'

var $ = require('jquery')
var Eev = require('eev')
var transformKey = require('./lib/transform-key')

module.exports = function ($el) {

  var r = new Eev()

  var bar = $('<div class="Progress-bar"/>').prependTo($el)[0]
  var done = $('<div class="Progress-done"/>').prependTo(bar)[0]
  var scrubber = $el.find('.Progress-scrubber')[0]

  var value = 0
  var scrubValue = false
  var componentWidth
  var elOffset
  var enabled = false

  var maxValue = function (v) {
    if (v) {
      $el.data('maxValue', v)
    }

    return $el.data('maxValue')
  }

  var change = function (slide) {
    r.emit(slide ? 'slide' : 'change', {
      value: value * maxValue(),
      progress: value
    })
  }

  var relayout = function () {
    // atualiza largura do component em caso de resize
    componentWidth = $el.outerWidth() // TODO : width ou outerWidth?
    elOffset = $el.offset()
  }

  var updateWidth = function () {
    var w = scrubValue !== false ? scrubValue : value
    var property = 'translateX(' + (w - 1) * 100 + '%)'
    done.style[transformKey] = property

    if (scrubber) {
      scrubber.style[transformKey] = property
    }

    if (scrubValue !== false) {
      requestAnimationFrame(updateWidth)
    }
  }

  var normalizeInput = function (n) {
    return Math.max(0, Math.min(n, 1))
  }

  var setValue = function (v, slide) {
    if (enabled) {
      value = normalizeInput(v)
      change(slide)
      if (scrubValue === false) {
        requestAnimationFrame(updateWidth)
      }
    }
  }

  var slide = function (v) {
    setValue(v, true)
  }

  var inputPosition = function (ev) {
    var offsetX = ev.pageX - elOffset.left
    return offsetX / componentWidth
  }

  var click = function (ev) {
    relayout()
    setValue(inputPosition(ev))
    updateWidth()
  }

  var touchmove = function (ev) {
    ev = ev.originalEvent || ev
    scrubValue = normalizeInput(inputPosition(ev.changedTouches[0]))
  }

  var touchstart = function (ev) {
    // TODO: adicionar classe que avisa o dragging
    relayout()
    touchmove(ev)
    requestAnimationFrame(updateWidth)
    ev.preventDefault()
  }

  var touchend = function () {
    // TODO: remover classe que avisa o dragging
    setValue(scrubValue)
    scrubValue = false
  }

  var pipes = function (composition) {
    $el.find('.Progress-pipe').remove()
    composition.forEach(function (sect) {
      $('<span class="Progress-pipe"></span>').css({ left: sect * 100 + '%' }).appendTo($el)
    })
  }

  var disable = function () {
    $el.off('.progress')
    enabled = false
  }

  var enable = function () {
    if (enabled) {
      return
    }

    $el
      .on('click.progress', click)
      .on('touchstart.progress', touchstart)
      .on('touchmove.progress', touchmove)
      .on('touchend.progress', touchend)
    enabled = true
  }

  enable()
  updateWidth()

  r.setValue = setValue
  r.slide = slide
  r.maxValue = maxValue
  r.pipes = pipes
  r.enable = enable
  r.disable = disable

  return r
}
