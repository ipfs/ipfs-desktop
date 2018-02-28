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
      className='button-reset bg-transparent ma0 pa0 outline-0 bn pointer'
      onClick={props.onClick} >
      <Icon
        className={`w2 h2 ${props.iconClass}`}
        name={props.icon}
        color={props.color} />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  iconClass: PropTypes.string,
  color: PropTypes.string
}

IconButton.defaultProps = {
  active: false,
  iconClass: ''
}
