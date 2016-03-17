'use strict'

var qwest = require('qwest')

module.exports = function (url, opts, progress) {
  return qwest.get(url, null, opts, function (xhr) {
    xhr.onprogress = progress
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('audio\/mpeg')
    }
  }).then(function (r) {
    return r.response
  })
}
