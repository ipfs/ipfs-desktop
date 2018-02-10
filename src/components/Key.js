import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Key.
 *
 * @param {Object} props
 *
 * @prop {Node} children - must be a string or a node.
 *
 * @return {ReactElement}
 */
export function Key (props) {
  return (
    <span className='key'>
      {props.children}
    </span>
  )
}

Key.propTypes = {
  children: PropTypes.node.isRequired
}

/**
 * Is a Key Combination
 *
 * @param {Object} props
 *
 * @prop {Array} keys - must be an array of strings.
 *
 * @return {ReactElement}
 */
export function KeyCombo (props) {
  const keys = []

  props.keys.forEach((key, index) => {
    keys.push(<Key key={`${index}k`}>{key}</Key>)
    keys.push(<span key={`${index}s`}> + </span>)
  })

  keys.pop()
  return <span>{keys}</span>
}

KeyCombo.propTypes = {
  keys: PropTypes.array.isRequired
}
