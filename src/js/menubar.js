import React from 'react'
import {render} from 'react-dom'

import Menu from './screens/menu'

document.addEventListener('DOMContentLoaded', () => {
  render(<Menu />, document.getElementById('menubar'))
})
