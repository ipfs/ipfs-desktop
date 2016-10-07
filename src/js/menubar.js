import {render} from 'react-dom'
import React from 'react'

import Menu from './screens/menu'

document.addEventListener('DOMContentLoaded', () => {
  render(<Menu />, document.getElementById('menubar'))
})
