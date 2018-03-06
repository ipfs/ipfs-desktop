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
  let className = 'button-reset sans-serif pointer bg-transparent bn outline-0 mv3 transition-all'
  if (props.active) {
    className += ' snow fill-snow'
  } else {
    className += ' aqua-muted fill-aqua-muted hover-snow hover-fill-snow'
  }

  return (
    <button onClick={props.onClick} className={className}>
      <Icon stroke className='center w3 mb3' name={props.icon} />
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