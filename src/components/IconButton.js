import React from 'react'
import PropTypes from 'prop-types'
import Icon from './Icon'

/**
 * Is a Button with an Icon.
 *
 * @param {Object} props
 *
 * @prop {String}   icon      - icon's name
 * @prop {Function} onClick   - function to be triggered when clicking the button
 * @prop {Bool}     [active]  - sets the state of the button
 *
 * @return {ReactElement}
 */
export default function IconButton (props) {
  return (
    <button
      className={`button-reset bg-transparent ma0 pa0 outline-0 bn pointer ${props.className}`}
      onClick={props.onClick} >
      <Icon
        className={`${props.iconClass} w${props.w} h${props.h}`}
        name={props.icon}
        color={props.color} />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  iconClass: PropTypes.string,
  color: PropTypes.string,
  w: PropTypes.number,
  h: PropTypes.number
}

IconButton.defaultProps = {
  active: false,
  iconClass: '',
  className: '',
  w: 2,
  h: 2
}
