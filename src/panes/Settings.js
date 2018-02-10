import React from 'react'
import PropTypes from 'prop-types'
import {ipcRenderer} from 'electron'

import Pane from '../components/Pane'
import Header from '../components/Header'
import InfoBlock from '../components/InfoBlock'
import CheckboxBlock from '../components/CheckboxBlock'
import {KeyCombo} from '../components/Key'

function generateOnChange (key) {
  return (value) => {
    ipcRenderer.send('update-setting', key, value)
  }
}

function quit () {
  ipcRenderer.send('quit-application')
}

function openNodeSettings () {
  ipcRenderer.send('open-node-settings')
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
        Enable <KeyCombo keys={['CTRL/CMD', 'ALT', 'S']} /> to take screenshots and add them to the repository.
      </span>
    )
  },
  {
    title: 'Download copied hash',
    setting: 'downloadHashShortcut',
    description: (
      <span>
        Enable <KeyCombo keys={['CTRL/CMD', 'ALT', 'D']} /> to download the last copied hash.
      </span>
    )
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
          title='Node Settings'
          info='Click to edit'
          key='node-settings'
          button={false}
          onClick={openNodeSettings} />

        <InfoBlock
          title='Quit'
          button={false}
          onClick={quit}
          info='Click to quit the application.' />
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
