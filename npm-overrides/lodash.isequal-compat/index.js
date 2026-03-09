'use strict'

const { isDeepStrictEqual } = require('node:util')

module.exports = function isEqual (value, other) {
  return isDeepStrictEqual(value, other)
}
