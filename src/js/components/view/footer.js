import React from 'react'
import PropTypes from 'prop-types'

export default function Footer (props) {
  return (
    <div className='footer'>
      {props.children}
    </div>
  )
}

Footer.propTypes = {
  children: PropTypes.node.isRequired
}
