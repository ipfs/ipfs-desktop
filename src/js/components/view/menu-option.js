import React from 'react'
import PropTypes from 'prop-types'

import Icon from './icon'

export default function MenuOption (props) {
  let className = 'menu-option'
  if (props.active) className += ' active'

  return (
    <button onClick={props.onClick} className={className}>
      <Icon name={props.icon} />
      <p>{props.name}</p>
    </button>
  )
}

MenuOption.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func,
  icon: PropTypes.string,
  name: PropTypes.string
}
