import React from 'react'
import PropTypes from 'prop-types'
import {resolve, join} from 'path'

const logoBlack = resolve(join(__dirname, '../img/ipfs-logo-black.png'))

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
        <img alt='IPFS Logo' src={`file://${logoBlack}`} />
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
