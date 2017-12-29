import React from 'react'
import PropTypes from 'prop-types'

import Icon from './icon'

/**
 * Is a menu option.
 *
 * @param {Object} props
 *
 * @prop {Bool}       [active]
 * @prop {Function}   onClick
 * @prop {String}     icon
 * @prop {String}     title
 *
 * @return {ReactElement}
 */
export default function MenuOption (props) {
  let className = 'menu-option'
  if (props.active) className += ' active'

  return (
    <button onClick={props.onClick} className={className}>
      <Icon name={props.icon} />
      <p>{props.title}</p>
    </button>
  )
}

MenuOption.propTypes = {
  active: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired
}
