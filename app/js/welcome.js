import {render} from 'react-dom'
import React from 'react'

import Setup from './components/setup'

document.addEventListener('DOMContentLoaded', () => {
  render(<Setup />, document.getElementById('welcome'))
})
