import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Pane's Footer.
 *
 * @param {Object} props
 *
 * @prop {Node} children
 *
 * @return {ReactElement}
 */
export default function Footer (props) {
  return (
    <div className='mv3 w-100 flex-shrink-0'>
      {props.children}
    </div>
  )
}

Footer.propTypes = {
  children: PropTypes.node.isRequired
}
