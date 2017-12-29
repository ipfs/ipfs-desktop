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
  if (props.name === 'ipfs') {
    return (
      <span className='icon'>
        <img src='../img/ipfs-logo-black.png' />
      </span>
    )
  }

  return (
    <span className={`icon ti-${props.name}`} />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired
}
