import React from 'react'
import PropTypes from 'prop-types'

import Icon from './Icon'

export function Menu (props) {
  return (
    <div className='flex flex-column h-100 w4 bg-navy-muted'>
      {props.children}
    </div>
  )
}

Menu.propTypes = {
  children: PropTypes.any.isRequired
}

export function MenuOption (props) {
  let className = 'button-reset sans-serif pointer bg-transparent bn outline-0 mv3'
  if (props.active) {
    className += ' white'
  } else {
    className += ' aqua-muted hover-white'
  }

  let icon
  if (props.active) {
    icon = <Icon stroke className='center w3 mb3' name={props.icon} color='snow' />
  } else {
    icon = <Icon stroke className='center w3 mb3' name={props.icon} color='aqua-muted' />
  }

  return (
    <button onClick={props.onClick} className={className}>
      {icon}
      <p className='ma0'>{props.title}</p>
    </button>
  )
}

MenuOption.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
}