import React from 'react'
import PropTypes from 'prop-types'

/**
 * Is an Icon.
 *
 * @param {Object} props
 *
 * @prop {String} name
 *
 * @return {ReactElement}
 */
export default function Icon (props) {
  return (
    <span className={`icon ti-${props.name}`} />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired
}
