import React from 'react'
import PropTypes from 'prop-types'

export default function Icon (props) {
  return (
    <div className={`icon-${props.name}`} {...props} />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired
}
