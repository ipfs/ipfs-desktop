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
export default function Key (props) {
  return (
    <span className='key'>
      {props.children}
    </span>
  )
}

Key.propTypes = {
  children: PropTypes.node.isRequired
}
