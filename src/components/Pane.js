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
  if (props.class) {
    className += ' ' + props.class
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
  class: PropTypes.string
}

Pane.defaultProps = {
  class: null
}
