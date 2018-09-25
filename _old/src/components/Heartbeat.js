import React from 'react'
import {resolve, join} from 'path'
import PropTypes from 'prop-types'

const icyLogo = resolve(join(__dirname, '../img/ipfs-logo-ice.png'))
const blackLogo = resolve(join(__dirname, '../img/ipfs-logo-black.png'))

/**
 * Is an Hearbeat.
 *
 * @param {Object} props
 *
 * @prop {Bool} [dead] - tells if the heartbeat is alive. If set to false, no animation will be shown
 *                       and the logo will be dark
 *
 * @return {ReactElement}
 */
export default function Heartbeat ({dead, className, ...props}) {
  if (dead) {
    return (
      <img src={`file://${blackLogo}`} {...props} />
    )
  } else {
    return (
      <img src={`file://${icyLogo}`} className={`heartbeat ${className}`} {...props} />
    )
  }
}

Heartbeat.propTypes = {
  dead: PropTypes.bool
}

Heartbeat.defaultProps = {
  dead: false,
  className: ''
}
