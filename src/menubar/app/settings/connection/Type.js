import React from 'react'
import { Dropdown } from '../Input'

const TYPES = {
  JS: 'js',
  GO: 'go',
  API: 'api'
}

export default (props) => (
  <Dropdown label='Type'
    {...props}
    options={TYPES} />
)
