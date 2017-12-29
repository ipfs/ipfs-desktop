import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Pane.
 *
 * @param {Object} props
 *
 * @prop {Node} children - must be elements of component Pane
 * @prop {String} [class] - additional class names
 *
 * @return {ReactElement}
 */
export default function PaneContainer (props) {
  let className = 'panes'
  if (props.className) {
    className += ' ' + props.className
  }

  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

PaneContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}
