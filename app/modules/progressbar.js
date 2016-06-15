'use strict'

var $ = require('jquery')
var transformKey = require('./lib/transform-key')
var EventEmitter = require('wolfy87-eventemitter')
var raf = require('raf')

module.exports = function ($el) {
  var r = new EventEmitter()

  var bar = $('<div class="Progress-bar"/>').prependTo($el)[0]
  var done = $('<div class="Progress-done"/>').prependTo(bar)[0]
  var scrubber = $el.find('.Progress-scrubber')[0]
  var isFocusable = $el.is('[tabindex]')

  var value = 0
  var scrubValue = false
  var componentWidth
  var elOffset
  var enabled = false

  var valueMax = function (v) {
    if (v) {
      $el.attr('aria-valuemax', Math.round(v))
    }

    return $el.attr('aria-valuemax')
  }

  var change = function (slide) {
    var valueNow = value * valueMax()
    r.emit(slide ? 'slide' : 'change', {
      value: valueNow,
      progress: value
    })
    $el.attr('aria-valuenow', Math.round(valueNow))
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
      raf(updateWidth)
    }
  }

  var normalizeInput = function (n) {
    return Math.max(0, Math.min(n, 1))
  }

  var set = function (v, slide) {
    if (enabled) {
      value = normalizeInput(v)
      change(slide)
      if (scrubValue === false) {
        raf(updateWidth)
      }
    }
  }

  var slide = function (v) {
    set(v, true)
  }

  var inputPosition = function (ev) {
    var offsetX = ev.pageX - elOffset.left
    return offsetX / componentWidth
  }

  var click = function (ev) {
    $el.focus()
    relayout()
    set(inputPosition(ev))
    updateWidth()
  }

  var touchmove = function (ev) {
    ev = ev.originalEvent || ev
    scrubValue = normalizeInput(inputPosition(ev.changedTouches[0]))
  }

  var touchstart = function (ev) {
    $el.focus()
    relayout()
    touchmove(ev)
    raf(updateWidth)
    ev.preventDefault()
  }

  var touchend = function () {
    set(scrubValue)
    scrubValue = false
    $el.blur()
  }

  var pips = function (composition) {
    $el.find('.Progress-pipe').remove()
    composition.forEach(function (sect) {
      $('<span class="Progress-pipe"></span>').css({ left: sect * 100 + '%' }).appendTo($el)
    })
  }

  var keydown = function (ev) {
    switch (ev.keyCode) {
      case 39:
        set(value + 0.05)
        break
      case 37:
        set(value - 0.05)
        break
      default:
    }
  }

  var disable = function () {
    $el.off('.progress')
    $el.removeAttr('tabindex')
    enabled = false
  }

  var enable = function (inert) {
    if (enabled) {
      return
    }

    if (inert !== true) {
      $el
        .on('click.progress', click)
        .on('touchstart.progress', touchstart)
        .on('touchmove.progress', touchmove)
        .on('touchend.progress', touchend)
        .on('keydown.progress', keydown)
    }

    if (isFocusable) {
      $el.attr('tabindex', '0')
    }

    enabled = true
  }

  enable($el.data('inert'))
  updateWidth()

  r.set = set
  r.slide = slide
  r.valueMax = valueMax
  r.pips = pips
  r.enable = enable
  r.disable = disable
  r.value = function () {
    return value
  }

  return r
}
