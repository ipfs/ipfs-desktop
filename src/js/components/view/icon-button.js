import React from 'react'
import PropTypes from 'prop-types'

import Icon from './icon'

export default function IconButton (props) {
  return (
    <button alt={props.alt} onClick={props.onClick} className='button-icon'>
      <Icon name={props.icon} />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string,
  alt: PropTypes.string,
  onClick: PropTypes.func
}

IconButton.defaultProps = {
  icon: '',
  alt: '',
  onClick () {}
}
