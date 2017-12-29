import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/view/pane'
import Header from '../components/view/header'
import InfoBlock from '../components/view/info-block'
import CheckboxBlock from '../components/view/checkbox-block'
import KeyCombo from '../components/view/key-combo'

function generateOnChange (key) {
  return (value) => {
    ipcRenderer.send('update-setting', key, value)
  }
}

function quit () {
  ipcRenderer.send('quit-application')
}

const options = [
  {
    title: 'Launch on startup',
    setting: 'autoLaunch'
  },
  {
    title: 'Auto add screenshots',
    setting: 'screenshotShortcut',
    description: (
      <span>
        Upload screenshots taken with <KeyCombo keys={['CTRL/CMD', 'ALT', 'S']} /> shortcut
      </span>
    )
  },
  {
    title: 'Download copied hash',
    setting: 'downloadHashShortcut',
    description: (
      <span>
        Download copied hash with <KeyCombo keys={['CTRL/CMD', 'ALT', 'D']} /> shortcut
      </span>
    )
  },
  {
    title: 'Light theme',
    setting: 'lightTheme'
  }
]

export default function Settings (props) {
  const opts = []

  options.forEach((option) => {
    opts.push((
      <CheckboxBlock
        title={option.title}
        key={option.setting}
        info={option.description}
        onChange={generateOnChange(option.setting)}
        value={props.settings[option.setting]} />
    ))
  })

  return (
    <Pane>
      <Header title='Settings' />

      <div className='main'>
        {opts}

        <InfoBlock
          title='Quit'
          button={false}
          onClick={quit}
          info='Click to quit Station' />
      </div>
    </Pane>
  )
}

Settings.propTypes = {
  settings: PropTypes.object
}

Settings.defaultProps = {
  settings: {
    autoLaunch: false,
    screenshotShortcut: false,
    downloadHashShortcut: false
  }
}
