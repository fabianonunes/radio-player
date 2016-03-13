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
    $el.focus()
    relayout()
    setValue(inputPosition(ev))
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
    requestAnimationFrame(updateWidth)
    ev.preventDefault()
  }

  var touchend = function () {
    setValue(scrubValue)
    scrubValue = false
    $el.blur()
  }

  var pipes = function (composition) {
    $el.find('.Progress-pipe').remove()
    composition.forEach(function (sect) {
      $('<span class="Progress-pipe"></span>').css({ left: sect * 100 + '%' }).appendTo($el)
    })
  }

  var keydown = function (ev) {
    switch (ev.keyCode) {
      case 39:
        setValue(value + 0.05)
        break
      case 37:
        setValue(value - 0.05)
        break
      default:
    }
  }

  var disable = function () {
    $el
      .off('.progress')
      .attr('tabindex', '-1')
    enabled = false
  }

  var enable = function (inert) {
    if (enabled) {
      return
    }

    $el
      .attr('tabindex', '0')
      .on('click.progress', click)
      .on('touchstart.progress', touchstart)
      .on('touchmove.progress', touchmove)
      .on('touchend.progress', touchend)
      .on('keydown.progress', keydown)

    enabled = true
  }

  enable($el.data('inert'))
  updateWidth()

  r.setValue = setValue
  r.slide = slide
  r.valueMax = valueMax
  r.pipes = pipes
  r.enable = enable
  r.disable = disable

  return r
}
