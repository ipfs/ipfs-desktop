import React from 'react'
import PropTypes from 'prop-types'

import Icon from './icon'

function onChangeWrapper (fn) {
  return event => {
    return fn(event.target.value)
  }
}

export default function IconDropdownList (props) {
  let options = props.data.map(el => {
    return (<option value={el}>{el}</option>)
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
