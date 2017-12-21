import React from 'react'
import {resolve, join} from 'path'
import PropTypes from 'prop-types'

const icyLogo = resolve(join(__dirname, '../../../img/ipfs-logo-ice.png'))
const blackLogo = resolve(join(__dirname, '../../../img/ipfs-logo-black.png'))

export default function Heartbeat (props) {
  if (props.dead) {
    return (
      <img onClick={props.onClickDead} src={`file://${blackLogo}`} />
    )
  } else {
    return (
      <img onClick={props.onClickAlive} src={`file://${icyLogo}`} className='heartbeat' />
    )
  }
}

Heartbeat.propTypes = {
  dead: PropTypes.bool,
  onClickAlive: PropTypes.func,
  onClickDead: PropTypes.func
}

Heartbeat.defaultProps = {
  dead: false,
  onClickAlive: () => {},
  onClickDead: () => {}
}
