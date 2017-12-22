import React from 'react'
import {render} from 'react-dom'
import register from '../controls/renderer'

import Menu from './screens/menu'

register()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menu />, document.getElementById('menubar'))
})
