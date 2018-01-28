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
 * @prop {String} color
 *
 * @return {ReactElement}
 */
export default function Icon (props) {
  let style = {}
  if (props.color) {
    style.color = props.color
  }

  if (props.name === 'ipfs') {
    return (
      <span className='icon'>
        <img alt='IPFS Logo' src={`file://${logoBlack}`} />
      </span>
    )
  }

  return (
    <span style={style} className={`icon ti-${props.name}`} />
  )
}

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string
}
