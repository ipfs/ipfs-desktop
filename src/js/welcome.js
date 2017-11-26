import React from 'react'
import {render} from 'react-dom'

import Setup from './screens/setup'

document.addEventListener('DOMContentLoaded', () => {
  render(<Setup />, document.getElementById('welcome'))
})
