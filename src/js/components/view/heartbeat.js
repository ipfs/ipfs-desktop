import React from 'react'
import {getLogo} from '../../../utils/logo'

export default function Heartbeat () {
  return (
    <img src={`file://${getLogo()}`} className='heartbeat' />
  )
}
