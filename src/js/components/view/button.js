import React from 'react'
import PropTypes from 'prop-types'

export default function Button (props) {
  return (
    <button onClick={props.onClick} className='button'>
      <span>{props.text}</span>
    </button>
  )
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}
