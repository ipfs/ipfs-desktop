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
  let className = 'pane'
  if (props.className) {
    className += ' ' + props.className
  }

  React.Children.forEach(props.children, (child) => {
    if (child.type === Footer) {
      className += ' has-footer'
    }
  })

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
