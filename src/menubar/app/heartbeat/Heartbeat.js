import React from 'react'

const Heartbeat = ({ size = 70, type = 'js', online = true }) => (
  <img
    alt='IPFS'
    src={`../../icons/${type === 'js' ? 'js-' : ''}ipfs-logo-${online ? 'on' : 'off'}.svg`}
    className={`v-mid ${online ? '' : 'o-40'} ${online ? 'heartbeat' : ''}`}
    style={{ width: size, height: size }}
  />
)

export default Heartbeat
