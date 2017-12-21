import React from 'react'
import PropTypes from 'prop-types'

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
