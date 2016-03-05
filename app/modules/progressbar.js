'use strict'

var $ = require('jquery')

var Progress = function (el) {

  var $el = $(el)
  var $scrubber = $el.find('.Progress-scrubber')
  var scrubberWidth = $scrubber.outerWidth()
  var scrubber = $scrubber[0]

  var bar = $('<div class="Progress-bar"/>').prependTo($el)[0]

  var value = 0
  var maxValue = $el.data('maxValue') || 100
  var isDragging = false
  var componentWidth
  var elOffset

  var updateDimensions = function () {
    // atualizar largura do component em caso de resize
    componentWidth = $el.outerWidth() // TODO : width ou outerWidth?
    elOffset = $el.offset()
  }

  var change = function () {
    console.log(value * maxValue)
  }

  var calcScrubberWidth = function (v) {
    var pixels = v * componentWidth
    var position = Math.max(pixels - scrubberWidth / 2, 0)
    return Math.min(position, componentWidth - scrubberWidth) / scrubberWidth
  }

  var updateWidth = function () {
    if (isDragging) {
      requestAnimationFrame(updateWidth)
    }

    var barStyle = bar.style
    var property = 'scaleX(' + value + ')'
    barStyle.transform = barStyle.webkitTransform = barStyle.msTransform = property

    var scrubberStyle = scrubber.style
    property = 'translateX(' + calcScrubberWidth(value) * 100 + '%)'
    scrubberStyle.transform = scrubberStyle.webkitTransform = scrubberStyle.msTransform = property
  }

  var setValue = function (v) {
    value = Math.max(0, Math.min(v, 1))
  }

  var inputPosition = function (ev) {
    var offsetX = ev.pageX - elOffset.left
    return offsetX / componentWidth
  }

  var click = function (ev) {
    updateDimensions()
    setValue(inputPosition(ev))
    updateWidth()
    change()
  }

  var touchmove = function (ev) {
    ev = ev.originalEvent || ev
    setValue(inputPosition(ev.changedTouches[0]))
  }

  var touchstart = function (ev) {
    updateDimensions()

    // TODO: adicionar classe que avisa o dragging
    if (!isDragging) {
      isDragging = true
      touchmove(ev)
      updateWidth()
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

}

module.exports = Progress
