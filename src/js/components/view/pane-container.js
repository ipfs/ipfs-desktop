import React from 'react'
import PropTypes from 'prop-types'

export default function PaneContainer (props) {
  return (
    <div className='panes'>
      {props.children}
    </div>
  )
}

PaneContainer.propTypes = {
  children: PropTypes.node.isRequired
}
