import React from 'react'
import PropTypes from 'prop-types'

export default function Menu (props) {
  return (
    <div className='menu'>
      {props.children}
    </div>
  )
}

Menu.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node)
  ]).isRequired
}
