import React from 'react'
import PropTypes from 'prop-types'

import Icon from './icon'

export default function IconButton (props) {
  return (
    <button onClick={props.onClick} className={`button-icon${props.active ? ' active' : ''}`}>
      <Icon name={props.icon} />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string,
  active: PropTypes.bool,
  onClick: PropTypes.func
}

IconButton.defaultProps = {
  icon: '',
  active: false,
  onClick () {}
}
