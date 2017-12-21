import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is a Button.
 *
 * @param {Object} props
 *
 * @prop {String}   text    - text to be shown within the button
 * @prop {Function} onClick - function to be triggered when clicking the button
 *
 * @return {ReactElement}
 */
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
