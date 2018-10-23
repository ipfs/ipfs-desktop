import React from 'react'
import { TextInput } from '../input/Input'

export default (props) => (
  <TextInput
    {...props}
    label='Api Address'
    placeholder='/ip4/127.0.0.1/tcp/5001'
    required />
)
