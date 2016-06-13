/* global MouseEvent, jasmine, describe, it, expect, beforeEach, loadFixtures, afterEach, spyOn, spyOnEvent, getJSONFixture, dump, xit, xdescribe */
'use strict'

var $ = require('jquery')
var bowser = require('bowser')
var audio = require('../app/modules/jukebox')
var disc = require('../app/modules/disc')

jasmine.getFixtures().fixturesPath = 'base/test/fixtures/'
jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures/'

var discData = getJSONFixture('10sec.json')

var d = disc(discData)

describe('<audio>', function () {
  // if (!bowser.ios) return
  // if (bowser.msie) return

  var initEvents = ['loadstart', 'durationchange', 'loadedmetadata', 'loadeddata', 'progress', 'canplay', 'canplaythrough', 'timeupdate']
  var stack

  var $mediaElement
  var $trigger
  var mediaElement
  var component

  beforeEach(function () {
    loadFixtures('markup.html')
    $trigger = $('#trigger')
    $mediaElement = $('audio')
    mediaElement = $mediaElement.get(0)
    mediaElement.defaultPlaybackRate = 5
    component = audio($mediaElement)

    stack = []
    initEvents.forEach(function (event) {
      $mediaElement.on(event, function () {
        stack.push(event)
      })
    })
  })

  describe('load', function () {
    it('deve remover o disco se houver')
    it('deve rebobinar o disco inserido')
  })

  describe('search', function () {
    beforeEach(function (done) {
      $trigger.show().click(function () {
        $trigger.hide()
        component.point(d)
        $mediaElement.one('loadeddata', function () {
          component.search(0.2)
          done()
        })
      })
      if (!bowser.mobile) {
        $trigger.click()
      }
    })

    it('deve colocar o audio na posição indicada', function (done) {
      $mediaElement.on('seeked', function () {
        expect(mediaElement.currentTime).toBe(4)
        done()
      })
    })

    it('deve passar de faixar quando preciso', function (done) {
      component.on('cued', function (track) {
        expect(track.title).toBe('two')
        done()
      })
      component.search(0.8)
    })

    it('deve colocar o audio na posição indicada, mesmo em outra faixa', function (done) {
      $mediaElement.on('seeked', function () {
        expect(mediaElement.currentTime).toBe(8)
        done()
      })
      component.search(0.9)
    })

    it('deve lançar ended ao terminar o disco', function (done) {
      component.on('ended', function () {
        expect(mediaElement.paused).toBe(true)
        done()
      })
      component.play()
      component.search(0.95)
    })
  })

  describe('point', function () {
    beforeEach(function (done) {
      spyOn(mediaElement, 'play').and.callThrough()

      component.once('cued', function () {
        done()
      })

      $trigger.show().click(function () {
        component.point(d)
        $trigger.hide()
      })

      if (!bowser.mobile) {
        $trigger.click()
      }
    })

    it('não deve começar a tocar no `loadeddata`', function (done) {
      $mediaElement.on('loadeddata', function () {
        expect(mediaElement.play).not.toHaveBeenCalled()
        done()
      })
    })

    it('deve começar a tocar no `canplay`', function (done) {
      $mediaElement.on('canplay', function () {
        expect(mediaElement.play).toHaveBeenCalled()
        done()
      })
    })

    it('deve atualizar a duração do audio', function (done) {
      $mediaElement.on('durationchange', function () {
        expect(mediaElement.duration).toBeGreaterThan(10)
        expect(mediaElement.duration).toBeLessThan(11)
        done()
      })
    })

    it('deve emitir um state `playing` assim que tocar', function (done) {
      $mediaElement.on('canplay', function () {
        expect(component.state()).toBe('playing')
        done()
      })
    })

    it('deve mudar de faixa automaticamente', function (done) {
      component.search(0.45)
      expect(mediaElement.currentTime).toBe(9)
      component.on('cued', function (track) {
        expect(track.title).toBe('two')
        expect(mediaElement.src).toBe(track.url)

        $mediaElement.one('playing', function () {
          expect(mediaElement.currentTime).toBe(0)
          expect(mediaElement.paused).toBeFalsy()

          setTimeout(function () {
            expect(mediaElement.currentTime).toBeGreaterThan(0)
            done()
          }, 200)
        })
      })
    })

    describe('todo', function () {
      it('não deve tocar se o point for quiet')
      it('deve colocar a currentTrack do disco na agulha')
      it('deve cancelar o watch ao remover o elemento da dom')
      it('não deve permitir o seek/search se não houver carregado o loadeddata')
    })
  })
})
