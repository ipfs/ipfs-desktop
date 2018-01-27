import React from 'react'
import {render} from 'react-dom'
import register from '../controls/renderer'

import Menubar from '../screens/menubar'

register()

document.addEventListener('DOMContentLoaded', () => {
  render(<Menubar />, document.getElementById('menubar'))
})
