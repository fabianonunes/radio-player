/* global jasmine, describe, it, expect, beforeEach, loadFixtures, afterEach, spyOn, spyOnEvent, getJSONFixture, dump */
'use strict'

var discr = require('../app/modules/disc')

jasmine.getFixtures().fixturesPath = 'base/test/fixtures/'
jasmine.getJSONFixtures().fixturesPath = 'base/test/fixtures/'

var discData = getJSONFixture('10sec.json')

describe('<disc segment>', function () {
  var disc
  beforeEach(function () {
    disc = discr(discData)
  })

  it('deve retornar as faixas que comportam o intervalo', function () {
    var segment = disc.segment(0, 0.25)
    expect(segment.urls.length).toEqual(1)
  })

  it('deve retornar retornar o inpoint e o outpoint da faixa', function () {
    var segment = disc.segment(0, 0.4)
    expect(segment.inpoint).toEqual(0)
    expect(segment.outpoint).toEqual(8)
  })

  it('deve retornar todas as faixas qdo o intervalo for cheio', function () {
    var segment = disc.segment(0, 1)
    expect(segment.urls).toEqual(discData.tracks.map(function (t) {
      return t.url
    }))
  })
})
