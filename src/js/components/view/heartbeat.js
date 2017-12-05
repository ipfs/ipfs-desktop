import React from 'react'
import {resolve, join} from 'path'

export const logo = resolve(join(__dirname, '../../../img/ipfs-logo-ice.png'))

export default function Heartbeat () {
  return (
    <img src={`file://${logo}`} className='heartbeat' />
  )
}
