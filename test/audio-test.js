/* global jasmine, describe, it, expect, beforeEach, loadFixtures, afterEach, spyOn, spyOnEvent, getJSONFixture, dump, xit, xdescribe */
'use strict'

var $ = require('jquery')
var bowser = require('bowser')
var audio = require('../app/modules/audio')
var disc = require('../app/modules/disc')

jasmine.getFixtures().fixturesPath = 'base/test/fixtures/'
jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures/'

var discData = getJSONFixture('10sec.json')

var d = disc(discData)

describe('<audio>', function () {
  if (!bowser.ios) return
  // if (bowser.msie) return

  var initEvents = ['loadstart', 'durationchange', 'loadedmetadata', 'loadeddata', 'progress', 'canplay', 'canplaythrough', 'timeupdate']
  var stack

  var $element
  var $trigger
  var element
  var component

  beforeEach(function () {
    loadFixtures('markup.html')
    $trigger = $('#trigger')
    $element = $('audio')
    element = $element.get(0)
    component = audio($element)
    stack = []
    initEvents.forEach(function (event) {
      $element.on(event, function () {
        stack.push(event)
      })
    })
  })

  xdescribe('load', function () {
    it('deve remover o disco se houver')
    it('deve rebobinar o disco inserido')
  })

  describe('search', function () {
    beforeEach(function (done) {
      $trigger.click(function () {
        component.point(d)
        $element.on('loadeddata', function () {
          component.search(0.2)
          done()
        })
      }).click()
    })

    it('deve colocar o audio na posição indicada', function (done) {
      $element.on('seeked', function () {
        expect(element.currentTime).toBe(2)
        done()
      })
    })
  })

  xdescribe('point', function () {
    beforeEach(function () {
      $trigger.click(function () {
        component.point(d)
      }).click()
      spyOn(element, 'play').and.callThrough()
    })

    it('não deve começar a tocar no `loadeddata`', function (done) {
      $element.on('loadeddata', function () {
        expect(element.play).not.toHaveBeenCalled()
        done()
      })
    })

    it('deve começar a tocar no `canplay`', function (done) {
      $element.on('canplay', function () {
        expect(element.play).toHaveBeenCalled()
        done()
      })
    })

    it('deve atualizar a duração do audio', function (done) {
      $element.on('durationchange', function () {
        expect(element.duration).toBeGreaterThan(10)
        expect(element.duration).toBeLessThan(11)
        done()
      })
    })

    it('deve emitir um state `playing` assim que tocar', function (done) {
      $element.on('canplay', function () {
        expect(component.state()).toBe('playing')
        done()
      })
    })

    xdescribe('click to play', function () {
      if (!(bowser.ios || (bowser.chrome && bowser.mobile))) {
        return
      }

      beforeEach(function (done) {
        $trigger.on('click', done)
        setTimeout(done, 1000)
      })

      it('deve rodar o timeupdate', function (done) {
        setTimeout(function () {
          done()
        }, 100)
      })
    })

    xdescribe('todo', function () {
      it('deve cancelar o watch ao remover o elemento da dom')
      it('não deve permitir o seek/search se não houver carregado o loadeddata')
    })
  })
})
