import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Pane.
 *
 * @param {Object} props
 *
 * @prop {Node} children
 * @prop {String} class are additional class names
 *
 * @return {ReactElement}
 */
export default function Pane (props) {
  let className = 'pane'
  if (props.class) {
    className += ' ' + props.class
  }

  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

Pane.propTypes = {
  children: PropTypes.node.isRequired,
  class: PropTypes.string
}

Pane.defaultProps = {
  class: null
}
