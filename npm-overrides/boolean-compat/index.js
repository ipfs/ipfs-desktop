'use strict'

function boolean (value) {
  const tag = Object.prototype.toString.call(value)
  switch (tag) {
    case '[object String]':
      return ['true', 't', 'yes', 'y', 'on', '1'].includes(String(value).trim().toLowerCase())
    case '[object Number]':
      return Number(value) === 1
    case '[object Boolean]':
      return Boolean(value.valueOf())
    default:
      return false
  }
}

function isBooleanable (value) {
  if (Object.prototype.toString.call(value) === '[object String]') {
    const normalized = String(value).trim().toLowerCase()
    return ['true', 't', 'yes', 'y', 'on', '1', 'false', 'f', 'no', 'n', 'off', '0'].includes(normalized)
  }
  if (Object.prototype.toString.call(value) === '[object Number]') {
    return Number(value) === 0 || Number(value) === 1
  }
  return Object.prototype.toString.call(value) === '[object Boolean]'
}

module.exports = {
  boolean,
  isBooleanable
}
