import React from 'react'
import PropTypes from 'prop-types'

import Key from './key'

/**
 * Is a Key Combination
 *
 * @param {Object} props
 *
 * @prop {Array} keys - must be an array of strings.
 *
 * @return {ReactElement}
 */
export default function KeyCombo (props) {
  const keys = []

  props.keys.forEach((key, index) => {
    keys.push(<Key key={`${index}k`}>{key}</Key>)
    keys.push(<span key={`${index}s`}> + </span>)
  })

  keys.pop()
  return keys
}

KeyCombo.propTypes = {
  keys: PropTypes.array.isRequired
}
