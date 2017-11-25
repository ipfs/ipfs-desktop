import React from 'react'
import PropTypes from 'prop-types'
import {DropdownList} from 'react-widgets'

import Icon from './icon'

const styles = {
  icon: {
    position: 'absolute',
    marginTop: '10px',
    marginLeft: '20px',
    fontSize: '20px'
  }
}

export default function IconDropdownList (props) {
  return (
    <div>
      <Icon
        name={props.icon}
        style={styles.icon} />
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
