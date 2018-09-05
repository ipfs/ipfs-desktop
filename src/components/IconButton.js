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
    <button onClick={props.onClick} title={props.title} className={`button-icon${props.active ? ' active' : ''}`}>
      <Icon color={props.color} name={props.icon} />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool,
  color: PropTypes.string,
  title: PropTypes.string
}

IconButton.defaultProps = {
  active: false
}
