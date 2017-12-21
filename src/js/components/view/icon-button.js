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
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool
}

IconButton.defaultProps = {
  active: false
}
