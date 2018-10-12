import React from 'react'
import { Dropdown } from '../Input'

const KEYSIZES = {
  2048: '2048',
  4096: '4096'
}

export default (props) => (
  <Dropdown label='Key size'
    {...props}
    options={KEYSIZES}
    defaultValue={KEYSIZES[4096]} />
)
