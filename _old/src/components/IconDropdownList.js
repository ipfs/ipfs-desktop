import React from 'react'
import PropTypes from 'prop-types'

import Icon from './Icon'

function onChangeWrapper (fn) {
  return event => {
    return fn(event.target.value)
  }
}

/**
 * Is a Dropdown List with an icon.
 *
 * @param {Object} props
 *
 * @prop {String}   icon          - icon's name
 * @prop {Array}    data          - an array with the options
 * @prop {Any}      defaultValue  - the default value
 * @prop {Function} onChange      - event handler for change
 *
 * @return {ReactElement}
 */
export default function IconDropdownList (props) {
  let options = props.data.map(el => {
    return (<option key={el} value={el}>{el}</option>)
  })

  return (
    <div className='dropdown-list'>
      <Icon name={props.icon} />
      <select
        defaultValue={props.defaultValue}
        onChange={onChangeWrapper(props.onChange)}>
        {options}
      </select>
    </div>
  )
}

IconDropdownList.propTypes = {
  icon: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  defaultValue: PropTypes.any.isRequired
}
