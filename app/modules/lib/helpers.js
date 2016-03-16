'use strict'

module.exports = {
  secondsToTime: function (time) {
    var h = time / 3600
    var m = h % 1 * 60
    var s = m % 1 * 60
    var f = Math.floor
    s = ('0' + f(s)).slice(-2)
    m = h ? ('0' + f(m)).slice(-2) : f(m)
    h = f(h)
    var r = [h, m, s]
    if (!h) {
      r.shift()
    }

    return r.join(':')
  }
}
