import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is an Input.
 *
 * @param {Object} props
 *
 * @prop {Any} children
 *
 * @return {ReactElement}
 */
export default function Input (props) {
  let className = 'input'
  if (props.className) {
    className += ' ' + props.className
  }

  return (
    <div className={className}>{props.children}</div>
  )
}

Input.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired
}
