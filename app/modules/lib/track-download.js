'use strict'

var qwest = require('qwest')

module.exports = function (url, opts, progress) {
  return qwest.get(url, null, opts, function (xhr) {
    xhr.overrideMimeType('audio/mpeg')
    xhr.onprogress = progress
  }).then(function (r) {
    return r.response
  })
}
