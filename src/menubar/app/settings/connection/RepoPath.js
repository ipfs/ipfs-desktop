import React from 'react'
import { TextInput } from '../Input'

export default (props) => (
  <TextInput
    {...props}
    label='Repo Path'
    placeholder='~/.ipfs-repo'
    required />
)
