import React from 'react'
import PropTypes from 'prop-types'
import Footer from './Footer'

/**
 * Is a Pane.
 *
 * @param {Object} props
 *
 * @prop {Node}   children
 * @prop {String} [class] - are additional class names
 *
 * @return {ReactElement}
 */
export default function Pane (props) {
  let className = 'relative h-100 overflow-y-auto overflow-x-hidden mh4 mv0 flex-grow-1'
  if (props.className) {
    className += ' ' + props.className
  }

  return (
    <div className={className}>
      {props.children}
    </div>
  )
}

Pane.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

Pane.defaultProps = {
  className: null
}
