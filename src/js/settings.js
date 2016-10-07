import React from 'react'
import {render} from 'react-dom'

import Settings from './screens/settings'

document.addEventListener('DOMContentLoaded', () => {
  render(<Settings />, document.getElementById('settings'))
})
