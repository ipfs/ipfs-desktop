import React from 'react'
import {render} from 'react-dom'

import SettingsScreen from './components/screens/settings/index'

document.addEventListener('DOMContentLoaded', () => {
  render(<SettingsScreen />, document.getElementById('settings'))
})
