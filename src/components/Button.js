import React from 'react'
import PropTypes from 'prop-types'

import Icon from './Icon'

export default function Button (props) {
  let classList = 'button-reset sans-serif outline-0 fw6 f5 white br1 bw0 ph4 pv2'
  if (props.disabled) {
    classList += ' bg-gray-muted gray'
  } else {
    classList += ` bg-${props.color} transition-all hover-bg-${props.color}-muted white pointer`
  }

  if (props.className) {
    classList += ' ' + props.className
  }

  return (
    <button
      className={classList}
      onClick={props.disabled ? undefined : props.onClick} >
      { props.icon &&
        <Icon name={props.icon} />
      }
      {props.children}
    </button>
  )
}

Button.propTypes = {
  children: PropTypes.any,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func.isRequired
}

Button.defaultProps = {
  disabled: false,
  color: 'aqua'
}
