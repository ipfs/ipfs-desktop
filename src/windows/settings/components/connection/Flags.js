import React from 'react'
import { TextInput } from '../input/Input'

export default ({ value, onChange, ...props }) => (
  <TextInput
    {...props}
    value={value.join(' ')}
    onChange={e => onChange(e.target.value.split(' '))}
    label='Flags'
    placeholder='E.g.: --routing=dhtclient'
    required />
)
