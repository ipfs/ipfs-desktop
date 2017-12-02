import React from 'react'
import PropTypes from 'prop-types'
import {DropdownList} from 'react-widgets'

import Icon from './icon'

export default function IconDropdownList (props) {
  return (
    <div className='dropdown-list'>
      <Icon name={props.icon} />
      <DropdownList
        data={props.data}
        defaultValue={props.defaultValue}
        onChange={props.onChange} />
    </div>
  )
}

IconDropdownList.propTypes = {
  icon: PropTypes.string.isRequired,
  data: PropTypes.array,
  onChange: PropTypes.func,
  defaultValue: PropTypes.any
}

IconDropdownList.defaultProps = {
  data: [],
  onChange () {}
}
