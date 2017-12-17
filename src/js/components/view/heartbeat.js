import React from 'react'
import {resolve, join} from 'path'
import PropTypes from 'prop-types'

const icyLogo = resolve(join(__dirname, '../../../img/ipfs-logo-ice.png'))
const blackLogo = resolve(join(__dirname, '../../../img/ipfs-logo-black.png'))

export default function Heartbeat (props) {
  if (props.running === null) {
    return (
      <img src={`file://${icyLogo}`} className='heartbeat' />
    )
  }

  if (props.running) {
    return (
      <img onClick={props.stopDaemon} src={`file://${icyLogo}`} className='heartbeat-btn heartbeat' />
    )
  }

  return (
    <img onClick={props.startDaemon} src={`file://${blackLogo}`} className='heartbeat-btn ' />
  )
}

Heartbeat.propTypes = {
  running: PropTypes.bool,
  startDaemon: PropTypes.func,
  stopDaemon: PropTypes.func
}

Heartbeat.defaultProps = {
  running: null,
  startDaemon: null,
  stopDaemon: null
}
