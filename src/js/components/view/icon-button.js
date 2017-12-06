import React from 'react'
import PropTypes from 'prop-types'

import Icon from './icon'

export default function IconButton (props) {
  return (
    <button onClick={props.onClick} className='button-icon'>
      <Icon name={props.icon} />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string,
  onClick: PropTypes.func
}

IconButton.defaultProps = {
  icon: '',
  onClick () {}
}
