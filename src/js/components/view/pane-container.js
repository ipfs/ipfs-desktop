import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Pane.
 *
 * @param {Object} props
 *
 * @prop {Node} children must be elements of component Pane
 *
 * @return {ReactElement}
 */
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
