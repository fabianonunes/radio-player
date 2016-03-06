'use strict'

var key

if ('MsTransform' in document.body.style) {
  key = 'MsTransform'
} else if ('MozTransform' in document.body.style) {
  key = 'MozTransform'
} else if ('WebkitTransform' in document.body.style) {
  key = 'WebkitTransform'
} else {
  key = 'transform'
}

module.exports = key
