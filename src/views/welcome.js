import React from 'react'
import {render} from 'react-dom'

import Welcome from '../screens/welcome'

document.addEventListener('DOMContentLoaded', () => {
  render(<Welcome />, document.getElementById('welcome'))
})
