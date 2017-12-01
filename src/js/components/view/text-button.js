import React from 'react'
import PropTypes from 'prop-types'

export default function TextButton (props) {
  return (
    <button onClick={props.onClick} className='button-text'>
      <span>{props.text}</span>
    </button>
  )
}

TextButton.propTypes = {
  text: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired
}
